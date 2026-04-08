package com.memoryos.app.data.api

import android.util.Log
import com.memoryos.app.util.TokenManager
import okhttp3.Interceptor
import okhttp3.Response

class AuthInterceptor(private val tokenManager: TokenManager) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()
        
        // Get token from secure storage
        val token = tokenManager.getToken()
        
        val requestBuilder = originalRequest.newBuilder()
        
        // Add Authorization header if token exists
        if (!token.isNullOrEmpty()) {
            requestBuilder.addHeader("Authorization", "Bearer $token")
        }
        
        val modifiedRequest = requestBuilder.build()
        return chain.proceed(modifiedRequest)
    }
}

class LoggingInterceptor : Interceptor {
    companion object {
        private const val TAG = "OkHttp"
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        
        val startTime = System.nanoTime()
        Log.d(TAG, "--> Send Request: ${request.url}")
        Log.d(TAG, "Methods: ${request.method}")
        
        val response = try {
            chain.proceed(request)
        } catch (e: Exception) {
            Log.d(TAG, "<-- HTTP FAILED: $e")
            throw e
        }

        val endTime = System.nanoTime()
        val duration = (endTime - startTime) / 1_000_000.0
        
        Log.d(TAG, "<-- Receive Response: ${response.code} ${response.message} (${duration}ms)")
        
        return response
    }
}
