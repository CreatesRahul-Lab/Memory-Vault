package com.memoryos.app.data.db

import androidx.room.TypeConverter
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import com.memoryos.app.data.model.Highlight

class RoomTypeConverters {
    private val gson = Gson()

    @TypeConverter
    fun fromStringList(list: List<String>?): String? {
        return if (list == null) null else gson.toJson(list)
    }

    @TypeConverter
    fun toStringList(json: String?): List<String>? {
        return if (json == null) null else {
            val type = object : TypeToken<List<String>>() {}.type
            gson.fromJson(json, type)
        }
    }

    @TypeConverter
    fun fromHighlightList(list: List<Highlight>?): String? {
        return if (list == null) null else gson.toJson(list)
    }

    @TypeConverter
    fun toHighlightList(json: String?): List<Highlight>? {
        return if (json == null) null else {
            val type = object : TypeToken<List<Highlight>>() {}.type
            gson.fromJson(json, type)
        }
    }

    @TypeConverter
    fun fromStringMap(map: Map<String, String>?): String? {
        return if (map == null) null else gson.toJson(map)
    }

    @TypeConverter
    fun toStringMap(json: String?): Map<String, String>? {
        return if (json == null) null else {
            val type = object : TypeToken<Map<String, String>>() {}.type
            gson.fromJson(json, type)
        }
    }
}
