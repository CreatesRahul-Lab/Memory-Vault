package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class Comment(
    @SerializedName("_id") val id: String = "",
    val item: String = "",
    val user: CommentUser? = null,
    val text: String = "",
    val createdAt: String? = null,
    val updatedAt: String? = null
)

data class CommentUser(
    @SerializedName("_id") val id: String = "",
    val name: String = "",
    val email: String = ""
)

data class CreateCommentRequest(
    val itemId: String,
    val text: String
)
