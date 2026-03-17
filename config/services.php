<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | DataForSEO API Credentials
    |--------------------------------------------------------------------------
    | Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD in your .env file.
    | You can find these in your DataForSEO account dashboard.
    | API docs: https://docs.dataforseo.com/v3/
    */
    'dataforseo' => [
        'login'    => env('DATAFORSEO_LOGIN'),
        'password' => env('DATAFORSEO_PASSWORD'),
        // When true, the service returns fake mock data — no API calls are made.
        // Set DATAFORSEO_SANDBOX=true in .env for local development/testing.
        'sandbox'  => env('DATAFORSEO_SANDBOX', false),
    ],

];
