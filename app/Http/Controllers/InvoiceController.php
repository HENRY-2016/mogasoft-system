<?php

namespace App\Http\Controllers;

use App\Models\CustomerModel;
use App\Models\InvoiceModel;
use App\Models\InvoiceItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class InvoiceController extends Controller
{
        public function index()
    {
        try {
            $data = InvoiceModel::with('items')->latest()->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Records fetched successfully',
                'data' => $data
            ], 200);

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
            'customer_id' => 'required|exists:customers,id',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
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
            // Get customer details
            $customer = CustomerModel::find($request->customer_id);

            if (!$customer) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Customer not found',
                    'data' => null
                ], 404);
            }

            $invoice = new InvoiceModel();
            $invoice->customer_id = $request->customer_id;
            $invoice->customer_name = $customer->name;
            $invoice->customer_email = $customer->email;
            $invoice->customer_phone = $customer->phone;
            $invoice->customer_address = $customer->address;
            $invoice->invoice_date = $request->invoice_date;
            $invoice->subtotal = $request->subtotal;
            $invoice->tax_rate = $request->tax_rate ?? 0;
            $invoice->tax_amount = $request->tax_amount ?? 0;
            $invoice->discount = $request->discount ?? 0;
            $invoice->total = $request->total;
            $invoice->status = 'pending';

            if ($invoice->save()) {
                // Save invoice items
                foreach ($request->items as $item) {
                    $invoiceItem = new InvoiceItem();
                    $invoiceItem->invoice_id = $invoice->id;
                    $invoiceItem->description = $item['description'];
                    $invoiceItem->quantity = $item['quantity'];
                    $invoiceItem->price = $item['price'];
                    $invoiceItem->amount = $item['amount'];
                    $invoiceItem->save();
                }

                // Load relationships for response
                $invoice->load('items', 'customer');

                return response()->json([
                    'status' => 'success',
                    'message' => 'Invoice created successfully',
                    'data' => $invoice
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice Not Created. Try Again',
                    'data' => null
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),// 'Database Error',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $data = InvoiceModel::with('items')->find($id);

            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Record fetched successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice Not Found',
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
            'customer_id' => 'required|exists:customers,id',
            'invoice_date' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.amount' => 'required|numeric|min:0',
            'subtotal' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0',
            'tax_amount' => 'nullable|numeric|min:0',
            'discount' => 'nullable|numeric|min:0',
            'total' => 'required|numeric|min:0',
            'updateId' => 'required|exists:invoices,id',
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
            $invoice = InvoiceModel::find($request->updateId);

            if ($invoice) {
                // Get customer details
                $customer = CustomerModel::find($request->customer_id);

                if (!$customer) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Customer not found',
                        'data' => null
                    ], 404);
                }

                $invoice->customer_id = $request->customer_id;
                $invoice->customer_name = $customer->name;
                $invoice->customer_email = $customer->email;
                $invoice->customer_phone = $customer->phone;
                $invoice->customer_address = $customer->address;
                $invoice->invoice_date = $request->invoice_date;
                $invoice->subtotal = $request->subtotal;
                $invoice->tax_rate = $request->tax_rate ?? 0;
                $invoice->tax_amount = $request->tax_amount ?? 0;
                $invoice->discount = $request->discount ?? 0;
                $invoice->total = $request->total;

                if ($invoice->save()) {
                    // Delete existing items and create new ones
                    InvoiceItem::where('invoice_id', $invoice->id)->delete();

                    foreach ($request->items as $item) {
                        $invoiceItem = new InvoiceItem();
                        $invoiceItem->invoice_id = $invoice->id;
                        $invoiceItem->description = $item['description'];
                        $invoiceItem->quantity = $item['quantity'];
                        $invoiceItem->price = $item['price'];
                        $invoiceItem->amount = $item['amount'];
                        $invoiceItem->save();
                    }

                    $invoice->load('items', 'customer');

                    return response()->json([
                        'status' => 'success',
                        'message' => 'Invoice updated successfully',
                        'data' => $invoice
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invoice Not Updated. Try Again',
                        'data' => null
                    ], 500);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice not found',
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
            'updateId' => 'required|exists:invoices,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => "Valid invoice ID is required",
                'data' => null
            ], 422);
        }

        try {
            $invoice = InvoiceModel::find($request->updateId);

            if ($invoice) {
                // Delete related invoice items first
                InvoiceItem::where('invoice_id', $invoice->id)->delete();

                if ($invoice->delete()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Invoice deleted successfully',
                        'data' => null
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Invoice not deleted. Try Again',
                        'data' => null
                    ], 500);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice not found',
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
