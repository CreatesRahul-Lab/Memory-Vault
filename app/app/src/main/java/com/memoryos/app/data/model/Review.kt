package com.memoryos.app.data.model

data class ReviewResponse(
    val dueItems: List<Item> = emptyList(),
    val resurfaced: List<Item> = emptyList()
)

data class ReviewRequest(
    val itemId: String,
    val quality: Int // 0-5 SM-2 scale
)

data class ReviewResult(
    val nextReviewDate: String,
    val interval: Int,
    val reviewCount: Int
)
