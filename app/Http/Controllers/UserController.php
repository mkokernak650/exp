<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Models\TableDetails;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $users = User::all();
        $columnsData = TableDetails::all()->pluck('column_details');
        return Inertia::render('Settings/User/UserIndex', compact('users', 'columnsData'));
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        return Inertia::render('Settings/User/AddUser');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(UserRequest $request)
    {
        $userData = array_merge($request->validated(), ['password'=>Hash::make($request->password)]);
        User::create($userData);
        $sendCredential= new SendCredentialsController();
        $sendCredential->sendMail($request->all());
        return back()->with('success', 'User created successfully.');
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $User = User::all()->where('id', $id);
        return $User;
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($ids)
    {
        $ids = explode(',', $ids);
        $i = 0;
        $response = '';

        while ($i < count($ids)) {
            $response = User::where('id', $ids[$i])->delete();
            $i++;
        }
        if ($response) {
            return response()->json(['msg' => 'User Deleted Successfully!', 'status_code' => 200]);
        } else {
            return response()->json(['msg' => 'Deleting Failed', 'status_code' => 500]);
        }
    }

    public function userProfileIndex()
    {
        $user = User::where('id', Auth::id())->get();
        return Inertia::render('Settings/User/UserProfile', compact('user'));
    }

    public function userProfileUpdate(Request $request)
    {
        $user = User::findOrFail(Auth::id());
        if (isset($request->password)) {
            if (Hash::check($request->password, $user->password)) {
                $request->validate([
                    'password'             => ['required'],
                    'new_password'         => ['required', 'min:6', 'string'],
                    'password_confirmation'=> ['required', 'same:new_password']

                ]);
                $changedData = $request->all();
                $changedData['password'] = Hash::make($request->new_password);

                $user->update($changedData);
                return response()->json(['msg' => 'User Updated Successfully!', 'status_code' => 201]);
            }{
                return response()->json(['msg'=>"Old password doesn't match!", 'status_code'=>403]);
            }
        } else {
            $user->update($request->all());
            return response()->json(['msg' => 'User Updated Successfully!', 'status_code' => 201]);
        }
    }
}
