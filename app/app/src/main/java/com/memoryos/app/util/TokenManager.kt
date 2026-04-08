package com.memoryos.app.util

import android.content.Context
import android.content.SharedPreferences
import javax.inject.Inject

class TokenManager @Inject constructor(private val context: Context) {
    private companion object {
        const val PREFS_NAME = "auth"
        const val TOKEN_KEY = "auth_token"
        const val USER_ID_KEY = "user_id"
        const val USER_EMAIL_KEY = "user_email"
        const val USER_NAME_KEY = "user_name"
    }

    private val prefs: SharedPreferences
        get() = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun getToken(): String? {
        return prefs.getString(TOKEN_KEY, null)
    }

    fun saveToken(token: String) {
        prefs.edit().putString(TOKEN_KEY, token).apply()
    }

    fun saveUser(userId: String, email: String, name: String) {
        prefs.edit()
            .putString(USER_ID_KEY, userId)
            .putString(USER_EMAIL_KEY, email)
            .putString(USER_NAME_KEY, name)
            .apply()
    }

    fun getUserId(): String? {
        return prefs.getString(USER_ID_KEY, null)
    }

    fun getUserEmail(): String? {
        return prefs.getString(USER_EMAIL_KEY, null)
    }

    fun getUserName(): String? {
        return prefs.getString(USER_NAME_KEY, null)
    }

    fun clearAuth() {
        prefs.edit().clear().apply()
    }

    fun isLoggedIn(): Boolean {
        return getToken() != null
    }
}
