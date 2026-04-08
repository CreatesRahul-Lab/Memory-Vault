package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class User(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val email: String = "",
    val digestFrequency: String = "off",
    val digestHour: Int = 9,
    val spacedRepetition: Boolean = false,
    val resurfaceOldItems: Boolean = true,
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class AuthRequest(
    val email: String,
    val password: String,
    val name: String? = null
)

data class AuthResponse(
    val user: User,
    val token: String
)

data class UserResponse(
    val user: User
)
