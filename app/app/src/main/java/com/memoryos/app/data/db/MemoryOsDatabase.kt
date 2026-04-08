package com.memoryos.app.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.memoryos.app.data.model.Item

@Database(
    entities = [Item::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(RoomTypeConverters::class)
abstract class MemoryOsDatabase : RoomDatabase() {
    abstract fun itemDao(): ItemDao

    companion object {
        @Volatile
        private var INSTANCE: MemoryOsDatabase? = null

        fun getInstance(context: Context): MemoryOsDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MemoryOsDatabase::class.java,
                    "memory_os_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
