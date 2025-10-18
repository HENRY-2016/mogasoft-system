<?php

namespace App\Http\Controllers;

use App\Models\InvoiceModel;
use App\Models\ReceiptItem;
use App\Models\ReceiptModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReceiptController extends Controller
{
     public function index()
    {
        try {
            $data = ReceiptModel::with(['items', 'invoice', 'customer'])->latest()->get();

            return response()->json([
                'status' => 'success',
                'message' => 'Receipts fetched successfully',
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
            'invoice_id' => 'required|exists:invoices,id',
            'date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'balance' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,credit_card,debit_card,bank_transfer,mobile_money,check,other',
            'transaction_id' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'check_number' => 'nullable|string|max:255',
            'mobile_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'received_by' => 'nullable|string|max:255',
            'status' => 'required|in:completed,partial',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
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
            // Get invoice details
            $invoice = InvoiceModel::with('customer')->find($request->invoice_id);

            if (!$invoice) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Invoice not found',
                    'data' => null
                ], 404);
            }

            $receipt = new ReceiptModel();
            $receipt->customer_id = $request->customer_id;
            $receipt->invoice_id = $request->invoice_id;
            $receipt->receipt_number = ReceiptModel::generateReceiptNumber();
            $receipt->date = $request->date;
            $receipt->amount_paid = $request->amount_paid;
            $receipt->balance = $request->balance;
            $receipt->payment_method = $request->payment_method;
            $receipt->transaction_id = $request->transaction_id;
            $receipt->bank_name = $request->bank_name;
            $receipt->check_number = $request->check_number;
            $receipt->mobile_number = $request->mobile_number;
            $receipt->notes = $request->notes;
            $receipt->received_by = $request->received_by;
            $receipt->status = $request->status;

            if ($receipt->save()) {
                // Save receipt items
                foreach ($request->items as $item) {
                    $receiptItem = new ReceiptItem();
                    $receiptItem->receipt_id = $receipt->id;
                    $receiptItem->description = $item['description'];
                    $receiptItem->amount = $item['amount'];
                    $receiptItem->save();
                }

                // Update invoice status if paid in full
                if ($receipt->balance == 0) {
                    $invoice->status = 'paid';
                    $invoice->save();
                }

                // Load relationships for response
                $receipt->load('items', 'invoice', 'customer');

                return response()->json([
                    'status' => 'success',
                    'message' => 'Receipt created successfully',
                    'data' => $receipt
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Receipt Not Created. Try Again',
                    'data' => null
                ], 500);
            }

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }

    public function show(string $id)
    {
        try {
            $data = ReceiptModel::with(['items', 'invoice', 'customer'])->find($id);

            if ($data) {
                return response()->json([
                    'status' => 'success',
                    'message' => 'Receipt fetched successfully',
                    'data' => $data
                ], 200);
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Receipt Not Found',
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
            'invoice_id' => 'required|exists:invoices,id',
            'date' => 'required|date',
            'amount_paid' => 'required|numeric|min:0',
            'balance' => 'required|numeric|min:0',
            'payment_method' => 'required|in:cash,credit_card,debit_card,bank_transfer,mobile_money,check,other',
            'transaction_id' => 'nullable|string|max:255',
            'bank_name' => 'nullable|string|max:255',
            'check_number' => 'nullable|string|max:255',
            'mobile_number' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'received_by' => 'nullable|string|max:255',
            'status' => 'required|in:completed,partial',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.amount' => 'required|numeric|min:0',
            'updateId' => 'required|exists:receipts,id',
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
            $receipt = ReceiptModel::find($request->updateId);

            if ($receipt) {
                $receipt->customer_id = $request->customer_id;
                $receipt->invoice_id = $request->invoice_id;
                $receipt->date = $request->date;
                $receipt->amount_paid = $request->amount_paid;
                $receipt->balance = $request->balance;
                $receipt->payment_method = $request->payment_method;
                $receipt->transaction_id = $request->transaction_id;
                $receipt->bank_name = $request->bank_name;
                $receipt->check_number = $request->check_number;
                $receipt->mobile_number = $request->mobile_number;
                $receipt->notes = $request->notes;
                $receipt->received_by = $request->received_by;
                $receipt->status = $request->status;

                if ($receipt->save()) {
                    // Delete existing items and create new ones
                    ReceiptItem::where('receipt_id', $receipt->id)->delete();

                    foreach ($request->items as $item) {
                        $receiptItem = new ReceiptItem();
                        $receiptItem->receipt_id = $receipt->id;
                        $receiptItem->description = $item['description'];
                        $receiptItem->amount = $item['amount'];
                        $receiptItem->save();
                    }

                    // Update invoice status
                    $invoice = InvoiceModel::find($request->invoice_id);
                    if ($invoice && $receipt->balance == 0) {
                        $invoice->status = 'paid';
                        $invoice->save();
                    }

                    $receipt->load('items', 'invoice', 'customer');

                    return response()->json([
                        'status' => 'success',
                        'message' => 'Receipt updated successfully',
                        'data' => $receipt
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Receipt Not Updated. Try Again',
                        'data' => null
                    ], 500);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Receipt not found',
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
            'updateId' => 'required|exists:receipts,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Validation failed',
                'errors' => "Valid receipt ID is required",
                'data' => null
            ], 422);
        }

        try {
            $receipt = ReceiptModel::find($request->updateId);

            if ($receipt) {
                // Delete related receipt items first
                ReceiptItem::where('receipt_id', $receipt->id)->delete();

                if ($receipt->delete()) {
                    return response()->json([
                        'status' => 'success',
                        'message' => 'Receipt deleted successfully',
                        'data' => null
                    ], 200);
                } else {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Receipt not deleted. Try Again',
                        'data' => null
                    ], 500);
                }
            } else {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Receipt not found',
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

    public function generatePDF($id)
    {
        try {
            $receipt = ReceiptModel::with(['items', 'invoice', 'customer'])->find($id);

            if (!$receipt) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Receipt not found',
                    'data' => null
                ], 404);
            }

            // For now, return success (PDF generation would be implemented here)
            return response()->json([
                'status' => 'success',
                'message' => 'PDF generation endpoint',
                'data' => $receipt
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'Error generating PDF',
                'error' => $e->getMessage(),
                'data' => null
            ], 500);
        }
    }
}
