<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Default Plugin Options
    |--------------------------------------------------------------------------
    */
    'api_key' => env('GOOGLE_MAPS_API_KEY', ''),

    'default_location' => [
        'lat' => 41.32836109345274,
        'lng' => 19.818383186960773,
    ],

    'default_zoom' => 8,

    'default_draggable' => true,

    'default_clickable' => false,

    'default_height' => '400px',

    'my_location_button' => 'My location',
];
