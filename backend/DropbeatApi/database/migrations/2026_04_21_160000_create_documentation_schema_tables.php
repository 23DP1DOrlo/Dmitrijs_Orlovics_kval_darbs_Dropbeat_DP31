<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('Lietotajs', function (Blueprint $table) {
            $table->increments('LietotajaID');
            $table->string('vards', 30);
            $table->string('uzvards', 30);
            $table->string('epasts', 50)->unique('lietotajs_epasts_unique');
            $table->unsignedTinyInteger('vecums');
            $table->string('lietotajavards', 16)->unique('lietotajs_lietotajavards_unique');
            $table->string('parole', 255);
        });

        Schema::create('Albumi', function (Blueprint $table) {
            $table->increments('AlbumaID');
            $table->string('Nosaukums', 70);
            $table->unsignedTinyInteger('Reitings')->nullable();
            $table->enum('zanrs', ['pop', 'roks', 'hiphops', 'elektroniska', 'dzezs', 'bluzs', 'klasiska', 'savs']);
            $table->unsignedTinyInteger('dziesmu_skaits');
            $table->date('iznaksanas_datums');
        });

        Schema::create('Dziesma', function (Blueprint $table) {
            $table->increments('DziesmaID');
            $table->unsignedInteger('AlbumaID');
            $table->string('Nosaukums', 70);
            $table->unsignedTinyInteger('Reitings')->nullable();
            $table->enum('zanrs', ['pop', 'roks', 'hiphops', 'elektroniska', 'dzezs', 'bluzs', 'klasiska', 'savs']);
            $table->time('ilgums');
            $table->date('iznaksanas_datums');

            $table->foreign('AlbumaID')->references('AlbumaID')->on('Albumi')->cascadeOnDelete();
        });

        Schema::create('Recenzija', function (Blueprint $table) {
            $table->increments('RecenzijasID');
            $table->unsignedInteger('DziesmaID');
            $table->unsignedInteger('AlbumaID');
            $table->string('teksts', 3000)->nullable();
            $table->unsignedTinyInteger('reitings');
            $table->date('datums');

            $table->foreign('DziesmaID')->references('DziesmaID')->on('Dziesma')->cascadeOnDelete();
            $table->foreign('AlbumaID')->references('AlbumaID')->on('Albumi')->cascadeOnDelete();
        });

        Schema::create('Lietotajs_Artists', function (Blueprint $table) {
            $table->unsignedInteger('Lietotaja_ArtistID')->primary();
            $table->foreign('Lietotaja_ArtistID')->references('LietotajaID')->on('Lietotajs')->cascadeOnDelete();
        });

        Schema::create('Lietotajs_Administrators', function (Blueprint $table) {
            $table->unsignedInteger('Lietotaja_AdminID')->primary();
            $table->foreign('Lietotaja_AdminID')->references('LietotajaID')->on('Lietotajs')->cascadeOnDelete();
        });

        Schema::create('Lietotajs_Recenzents', function (Blueprint $table) {
            $table->unsignedInteger('Lietotaja_RecenzentsID')->primary();
            $table->unsignedInteger('RecenzijasID');
            $table->foreign('Lietotaja_RecenzentsID')->references('LietotajaID')->on('Lietotajs')->cascadeOnDelete();
            $table->foreign('RecenzijasID')->references('RecenzijasID')->on('Recenzija')->cascadeOnDelete();
        });

        Schema::create('Dziesma_Artists', function (Blueprint $table) {
            $table->unsignedInteger('DziesmaID');
            $table->unsignedInteger('Lietotaja_ArtistID');
            $table->primary(['DziesmaID', 'Lietotaja_ArtistID']);

            $table->foreign('DziesmaID')->references('DziesmaID')->on('Dziesma')->cascadeOnDelete();
            $table->foreign('Lietotaja_ArtistID')->references('Lietotaja_ArtistID')->on('Lietotajs_Artists')->cascadeOnDelete();
        });

        Schema::create('Albums_Artists', function (Blueprint $table) {
            $table->unsignedInteger('AlbumaID');
            $table->unsignedInteger('Lietotaja_ArtistID');
            $table->primary(['AlbumaID', 'Lietotaja_ArtistID']);

            $table->foreign('AlbumaID')->references('AlbumaID')->on('Albumi')->cascadeOnDelete();
            $table->foreign('Lietotaja_ArtistID')->references('Lietotaja_ArtistID')->on('Lietotajs_Artists')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('Albums_Artists');
        Schema::dropIfExists('Dziesma_Artists');
        Schema::dropIfExists('Lietotajs_Recenzents');
        Schema::dropIfExists('Lietotajs_Administrators');
        Schema::dropIfExists('Lietotajs_Artists');
        Schema::dropIfExists('Recenzija');
        Schema::dropIfExists('Dziesma');
        Schema::dropIfExists('Albumi');
        Schema::dropIfExists('Lietotajs');
    }
};
