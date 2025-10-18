<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
class UserController extends Controller
{
    public function index()
    {
        try {
            $data = User::get();
            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Records fetched successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to fetched records',
                    'data' => null
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request){
        $existingRecord = User::where('email', $request->email)
            ->first();

        if ($existingRecord) {
            // Build error messages for each field that matches
            $errors = [];

            if ($existingRecord->email == $request->email) {
                $errors['email'] = ['This email already exists with these details'];
            }

            return response()->json([
                'status' => 'error',
                'message' => 'Given Record Data Already Exists',
                'errors' => $errors,
                'data' => null
            ], 422);
        }

        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'name' => 'required',
            'password' => 'required',
        ]);


        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'data' => null
            ], 422);
        }

        try {
            $record = new User();
            $record->email = $request->email;
            $record->name = $request->name;
            $record-> password = bcrypt($request->password);


            if ($record->save()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Record created successfully',
                    'data' => null
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Record Not Created. Try Again',
                    'data' => null
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function show(string $id)
    {
        try {

            $data = User::find($id);
            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Record fetched successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Record Not found. Try Again',
                    'data' => null
                ], 500);
            }


        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    function logIn (Request $request){
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'required',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'data' => null
            ], 422);
        }
        try {
            // Find the user by email
        $user = User::where('email', $request->email)->first();

            if($user && Hash::check($request->password, $user->password)) {
                $data = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                ];

                return response()->json([
                    'status' => 'success',
                    'message' => 'Logged in  successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invalid credentials UserName OR Password Try Again ..',
                    'data' => null
                ], 500);
            }


        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    function updatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ]);
        if ($validator->fails()) {
            return response()->json([
                'status' => 'required',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'data' => null
            ], 422);
        }
        try {
            // Find the user by Contact
            $user = User::where('email', $request->email)->first();

            // Check if user exists
            if (!$user) {
                return response()->json([
                    'status' => 'invalid',
                    'message' => 'Invalid Email, Password Not updated. Try Again',
                    'data' => null
                ], 500);
            }

            // Hash and update password
            $user->password = Hash::make($request->password);
            $user->save();


            if ($user->save()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Password updated successfully',
                    'data' => null
                ], 200);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request)
    {

        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required',
            'updateId' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'required',
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $record = User::find($request->updateId);
            if ($record) {
                $record->email = $request->email;
                $record->name = $request->name;
                $record->save();

                return response()->json([
                    'status' => 'success',
                    'message' => 'Record updated successfully',
                    'data' => null
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Record not found',
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }


    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updateId' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'required',
                'message' => 'Validation failed',
                'errors' => "Delete Id Is Required",
            ], 422);
        }
        try {
            $record = User::find($request->updateId);
            if ($record) {
                $record->delete();
                return response()->json([
                    'status' => 'success',
                    'message' => 'Record deleted successfully',
                    'data' => null
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Record not deleted. Try Again',
                    'data' => null
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
