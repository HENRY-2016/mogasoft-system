<?php

namespace App\Http\Controllers;

use App\Models\CustomerModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    public function index()
    {
        try {
            $data = CustomerModel::latest()->get();

            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Customers fetched successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Failed to fetch customers',
                    'data' => null
                ], 500);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
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
            $customer = new CustomerModel();
            $customer->name = $request->name;
            $customer->email = $request->email;
            $customer->phone = $request->phone;
            $customer->address = $request->address;
            $customer->company_name = $request->company_name;
            $customer->tax_number = $request->tax_number;

            if ($customer->save()) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Customer created successfully',
                    'data' => $customer
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer Not Created. Try Again',
                    'data' => null
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $data = CustomerModel::find($id);

            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Customer fetched successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer Not Found',
                    'data' => null
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:customers,email,' . $request->updateId,
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'company_name' => 'nullable|string|max:255',
            'tax_number' => 'nullable|string|max:50',
            'updateId' => 'required|exists:customers,id',
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
            $customer = CustomerModel::find($request->updateId);

            if ($customer) {
                $customer->name = $request->name;
                $customer->email = $request->email;
                $customer->phone = $request->phone;
                $customer->address = $request->address;
                $customer->company_name = $request->company_name;
                $customer->tax_number = $request->tax_number;

                if ($customer->save()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Customer updated successfully',
                        'data' => $customer
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Customer Not Updated. Try Again',
                        'data' => null
                    ], 500);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer not found',
                    'data' => null
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function destroy(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'updateId' => 'required|exists:customers,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => "Valid customer ID is required",
                'data' => null
            ], 422);
        }

        try {
            $customer = CustomerModel::find($request->updateId);

            if ($customer) {
                if ($customer->delete()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Customer deleted successfully',
                        'data' => null
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Customer not deleted. Try Again',
                        'data' => null
                    ], 500);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer not found',
                    'data' => null
                ], 404);
            }
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Database Error',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
