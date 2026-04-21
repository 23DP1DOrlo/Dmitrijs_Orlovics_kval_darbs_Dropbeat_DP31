<?php

namespace Database\Seeders;

use App\Models\Artist;
use App\Models\ArtistProfile;
use App\Models\Genre;
use App\Models\Release;
use App\Models\ReleaseStat;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $admin = User::create([
            'name' => 'DropBeat Admin',
            'email' => 'admin@dropbeat.lv',
            'password' => Hash::make('Admin123!'),
            'role' => 'admin',
        ]);

        $artistUser = User::create([
            'name' => 'Dmitrijs Orlovics',
            'email' => 'artist@dropbeat.lv',
            'password' => Hash::make('Artist123!'),
            'role' => 'artist',
        ]);

        User::create([
            'name' => 'Demo Klausitajs',
            'email' => 'listener@dropbeat.lv',
            'password' => Hash::make('Listener123!'),
            'role' => 'listener',
        ]);

        $artist = Artist::create([
            'user_id' => $artistUser->id,
            'stage_name' => 'Risa Vibe',
            'country' => 'LV',
            'is_verified' => true,
        ]);

        ArtistProfile::create([
            'artist_id' => $artist->id,
            'city' => 'Riga',
            'label_name' => 'DropBeat Collective',
            'bio' => 'Elektroniskas un hip-hop iedvesmotas skanas ar modernu noskanu.',
            'instagram_url' => 'https://instagram.com/risa.vibe',
            'youtube_url' => 'https://youtube.com/@risavibe',
        ]);

        $genres = collect([
            'Hip-Hop',
            'Electronic',
            'Lo-Fi',
            'Trap',
        ])->mapWithKeys(fn ($name) => [$name => Genre::create(['name' => $name])]);

        $releases = [
            ['title' => 'Midnight Flow', 'type' => 'single', 'genre' => 'Hip-Hop', 'date' => '2026-02-12'],
            ['title' => 'Neon Streets EP', 'type' => 'ep', 'genre' => 'Electronic', 'date' => '2026-01-21'],
            ['title' => 'Grey Atmosphere', 'type' => 'album', 'genre' => 'Lo-Fi', 'date' => '2025-11-04'],
        ];

        foreach ($releases as $index => $item) {
            $release = Release::create([
                'artist_id' => $artist->id,
                'genre_id' => $genres[$item['genre']]->id,
                'title' => $item['title'],
                'release_date' => $item['date'],
                'type' => $item['type'],
                'description' => 'Demo relize kvalifikacijas darba funkcionalitates demonstracijai.',
                'duration_seconds' => 1500 + ($index * 200),
                'is_published' => true,
            ]);

            ReleaseStat::create([
                'release_id' => $release->id,
                'stat_date' => now()->subDays(30 - $index)->toDateString(),
                'stream_count' => 15000 + ($index * 6000),
                'like_count' => 1800 + ($index * 500),
                'share_count' => 260 + ($index * 80),
            ]);
        }
    }
}
