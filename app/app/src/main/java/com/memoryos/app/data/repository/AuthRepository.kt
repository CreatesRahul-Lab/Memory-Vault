package com.memoryos.app.data.repository

import com.memoryos.app.data.api.MemoryOsApi
import com.memoryos.app.data.model.AuthRequest
import com.memoryos.app.data.model.AuthResponse
import com.memoryos.app.util.TokenManager
import javax.inject.Inject

class AuthRepository @Inject constructor(
    private val api: MemoryOsApi,
    private val tokenManager: TokenManager
) {
    suspend fun register(email: String, password: String, name: String): Result<AuthResponse> {
        return try {
            val request = AuthRequest(email, password, name)
            val response = api.register(request)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                tokenManager.saveToken(body.token)
                tokenManager.saveUser(body.user.id, body.user.email, body.user.name)
                Result.success(body)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun login(email: String, password: String): Result<AuthResponse> {
        return try {
            val request = AuthRequest(email, password)
            val response = api.login(request)
            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                tokenManager.saveToken(body.token)
                tokenManager.saveUser(body.user.id, body.user.email, body.user.name)
                Result.success(body)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMe(): Result<String> {
        return try {
            val response = api.getMe()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!.user.id)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun logout(): Result<Unit> {
        return try {
            api.logout()
            tokenManager.clearAuth()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun isLoggedIn(): Boolean {
        return tokenManager.isLoggedIn()
    }
}
