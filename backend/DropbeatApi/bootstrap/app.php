<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            $errors = $exception->errors();
            $firstError = null;
            foreach ($errors as $fieldErrors) {
                if (is_array($fieldErrors) && isset($fieldErrors[0])) {
                    $firstError = $fieldErrors[0];
                    break;
                }
            }

            return response()->json([
                'message' => $firstError ?? 'Validacijas kluda.',
                'errors' => $errors,
            ], 422);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'Lai pieklutu sim endpointam, nepieciesama autentifikacija.',
            ], 401);
        });

        $exceptions->render(function (ModelNotFoundException $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'Pieprasitais resurss nav atrasts.',
            ], 404);
        });

        $exceptions->render(function (HttpExceptionInterface $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => $exception->getMessage() !== '' ? $exception->getMessage() : 'HTTP kluda.',
            ], $exception->getStatusCode());
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if (config('app.debug')) {
                return response()->json([
                    'message' => 'Neapstrādāta servera kļūda.',
                    'error' => $exception->getMessage(),
                ], 500);
            }

            return response()->json([
                'message' => 'Iekšēja servera kļūda. Mēģini vēlreiz vēlāk.',
            ], 500);
        });
    })->create();
