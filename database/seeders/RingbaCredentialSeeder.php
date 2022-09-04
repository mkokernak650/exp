<?php

namespace Database\Seeders;

use App\Models\RingbaAuthDetails;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class RingbaCredentialSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        RingbaAuthDetails::insert([
            'user_info'       => '{"username":"mkokernak@buyottads.com","password":"Msk565656!"}',
            'auth_details'    => '{"access_token":"eh_FBBxqzjz-jkIY7OygJbPRh_t0ZyWfBkDjZl0kFiiaSikd_-0vIJvFGp9ZDnAWxPyHFfU2LZRK_9CAeP8mYxM3zh0Bw-PF6MNBZLYuBYr6PyCo6oeK_he1B_1caIpMtTaBO8CzEG6cBoOVJAoR9CCU5EeC-rPm2bhzmykNqh1ejrMTiH88c31_F3d3YgWp_XUTrNLDimubC_nJ6Zl08YRtj3Dkj0Bw5lCemOJcWVj4PmgqSN0FNUEbEEL0yFLHUpYoJbYg0Igqc69A8I5-uU7kBZ_hCbSj7e-H0Lti0mQGQsw3ZMNM4EUuw7t8hJoem15p8e5pYxgsaImCAqtnmDao8NKwcwfeDA-aeXQ_66RxF_PTY2Hgnum6BCZyRHQwqTszDZNABiHQcfuPQnK2eh1q44HF6noHRs3mVOJS7dyVbt7ny4TA0Wb8z3WLxQdLGKI9Axsa7Vh__5i8xpuhT0jWRU9rYFCDDK8_8tXPHqCwk5WaNDCwlvcjA5YHFHDnqZk4gw","token_type":"bearer","expires_in":3599,"refresh_token":"SxY-19TAkw8hIesxU7cegFLCG2iwQDeGe8jOZwpIzjCfFydylH_MKuuO9Y5xRAQJKN9uIduwgHkBC3HPG6Pm_W7Hx2h9tRkXV8ZR6oIyMpiTxO0qW6dCMEJgjiK9cMpXrIJf6TYRL7hrNFRaz4fTQmBKQHPuzaDq1X4RYkaYBhiWPajXdz0VQp9kzHJO8Iavl3kYmW2KNvNPy0DnB3NuCVTCTIqyqDvjnnEf_v1BYAq0lxEIcxD6VEnLPesBAwB_dniS9DYY0dOWuXXpVy9rkKXM02dq1C1YQBMlv8IgPhaGvMgOfyXhzjHosQp_YcmcJwDMk1ifONPf-a5Iqqv9lBtFs_Vt9SgIrDa5O51TJGBMnOq13V2ru-XP2A7lnaLzWEpySZUW9lQcylTr3NDrmLgxu4U3ziwhPjbK8ZbCnFN7d2AnS77uOu_bpGgaVJey0B5MsL2gRBiECq9sQN0CNMFsZC3Sg1tg8DYozy3B6JvARVJAmKL7h4MV8ElJGvvqJuay2Dro_ROv7M0udY2dHGswzAw","userName":"mkokernak@buyottads.com","userId":"07ee4e07-a65c-4084-849e-5b1ae095d7fc","twoAuthNeeded":"False",".issued":"Sat, 03 Jul 2021 04:48:56 GMT",".expires":"Sat, 03 Jul 2021 05:48:56 GMT"}',
            'account_details' => '{"accountCreationEpoch":1588511463171,"timeZoneId":"Eastern Standard Time","accountAddress":{"streetAddress":"650 Huntington Avenue","city":"Boston","region":"MA","postalCode":"02115","countryName":"United States","countryCode":"US"},"accountMngrId":"AMda0e2b2f54cf41a3ab6c31f593e3dbc2","id":"RA30665ea879dd4e9587342088ee1f39a8","name":"ConsumerEXP","accountId":"RA30665ea879dd4e9587342088ee1f39a8","enabled":true,"version":1}',
            'api_token'       => '{"api_token": "09f0c9f0231dcf881399644fae2f1a125212517a8eeb8684fe8576f6786ef1cea78f37b28dfb251b4b74639b0df959384db8694c0641a09e7eeab700b4f86491735aa22e71245c0c205e9990457d4a5ab2b0c44ae054b3db1c6c685e69f98106f17db33aa9c512c3c31555cfd29ad63191829330"}',
            'status'          => 1,
        ]);
    }
}
