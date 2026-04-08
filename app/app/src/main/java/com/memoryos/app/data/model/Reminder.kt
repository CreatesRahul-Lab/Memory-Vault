package com.memoryos.app.data.model

import com.google.gson.annotations.SerializedName

data class Reminder(
    @SerializedName("_id") val id: String = "",
    val user: String? = null,
    val item: ReminderItem? = null,
    val triggerAt: String = "",
    val message: String? = null,
    val fired: Boolean = false,
    val createdAt: String? = null
)

data class ReminderItem(
    @SerializedName("_id") val id: String = "",
    val title: String = "",
    val url: String = "",
    val type: String = "page"
)

data class RemindersResponse(
    val reminders: List<Reminder>,
    val due: List<Reminder>
)

data class CreateReminderRequest(
    val itemId: String,
    val triggerAt: String,
    val message: String? = null
)
