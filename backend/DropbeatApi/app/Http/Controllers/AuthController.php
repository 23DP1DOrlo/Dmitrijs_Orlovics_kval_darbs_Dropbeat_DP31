<?php

namespace App\Http\Controllers;

use App\Models\Artist;
use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password as PasswordBroker;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'min:2', 'max:120'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
            'role' => ['required', 'in:artist,listener'],
            'stage_name' => ['nullable', 'string', 'min:2', 'max:120'],
        ], [
            'password.confirmed' => 'Ievadi vienadu paroli abos laukos.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        if ($user->role === 'artist') {
            Artist::create([
                'user_id' => $user->id,
                'stage_name' => $validated['stage_name'] ?? $validated['name'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Nederīgi pieslēgšanās dati'], 422);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()?->delete();
        return response()->json(['message' => 'Veiksmīgi atslēdzies']);
    }

    public function forgotPassword(Request $request)
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        // Local mode: avoid SMTP timeouts and generate token/reset URL directly.
        if ($user && app()->environment('local')) {
            $token = PasswordBroker::createToken($user);
            $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://127.0.0.1:5173'), '/');
            $resetUrl = $frontendUrl.'/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset());

            Log::info('Password reset link generated (local mode).', [
                'email' => $user->email,
                'reset_url' => $resetUrl,
            ]);

            return response()->json(['message' => 'Paroles atiestatīšanas saite sagatavota lokāli (skat. servera logu).']);
        }

        try {
            $status = PasswordBroker::sendResetLink(['email' => $validated['email']]);
        } catch (\Throwable $exception) {
            Log::error('Failed to send password reset link.', [
                'email' => $validated['email'],
                'error' => $exception->getMessage(),
            ]);

            // Local fallback: if SMTP fails, still generate a usable reset URL.
            if (app()->environment('local')) {
                if ($user) {
                    $token = PasswordBroker::createToken($user);
                    $frontendUrl = rtrim((string) env('FRONTEND_URL', 'http://127.0.0.1:5173'), '/');
                    $resetUrl = $frontendUrl.'/reset-password?token='.$token.'&email='.urlencode($user->getEmailForPasswordReset());

                    Log::info('Password reset link generated after SMTP failure (local fallback).', [
                        'email' => $user->email,
                        'reset_url' => $resetUrl,
                    ]);
                }

                return response()->json([
                    'message' => 'E-pasta nosūtīšana neizdevās, bet lokālā atiestatīšanas saite ir sagatavota (skat. servera logu).',
                ]);
            }

            return response()->json([
                'message' => 'Neizdevās nosūtīt saiti. Pārbaudi e-pasta iestatījumus servera pusē.',
            ], 503);
        }

        if ($status === PasswordBroker::RESET_LINK_SENT) {
            return response()->json(['message' => 'Paroles atjaunosanas saite nosutita uz e-pastu.']);
        }

        if ($status === PasswordBroker::RESET_THROTTLED) {
            return response()->json(['message' => 'Saite nesen jau tika pieprasīta. Mēģini vēlreiz pēc minūtes.'], 429);
        }

        // Do not disclose whether e-mail exists in system.
        return response()->json(['message' => 'Ja e-pasts eksiste, atjaunosanas saite ir nosutita.']);
    }

    public function resetPassword(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'confirmed', Password::min(8)->mixedCase()->numbers()->symbols()],
        ], [
            'password.confirmed' => 'Ievadi vienadu paroli abos laukos.',
        ]);

        $status = PasswordBroker::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === PasswordBroker::PASSWORD_RESET) {
            return response()->json(['message' => 'Parole veiksmigi atjaunota.']);
        }

        return response()->json(['message' => 'Neizdevās atjaunot paroli.'], 422);
    }

    public function me(Request $request)
    {
        return $request->user();
    }

    public function updateMe(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'min:2', 'max:120'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update([
            'name' => $validated['name'] ?? $user->name,
            'email' => $validated['email'] ?? $user->email,
        ]);

        return $user->fresh();
    }
}
