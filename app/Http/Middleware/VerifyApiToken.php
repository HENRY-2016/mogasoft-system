<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyApiToken
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
            $validToken = env('API_ACCESS_TOKEN');

            $authHeader = $request->header('Authorization'); // Retrieve the Authorization header


            if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
                $token = substr($authHeader, 7); // Remove "Bearer " prefix
            } else {
                return response()->json(['message' => 'Unauthorized. Invalid or missing token.'], 401);
            }


            // Compare token with .env value
            if ($token !== $validToken) {
                return response()->json(['message' => 'Unauthorized. Invalid or missing token.'], 401);
            }


            return $next($request);
    }
}
