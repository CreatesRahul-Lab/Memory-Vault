package com.memoryos.app.di

import android.content.Context
import com.google.gson.Gson
import com.memoryos.app.BuildConfig
import com.memoryos.app.data.api.AuthInterceptor
import com.memoryos.app.data.api.LoggingInterceptor
import com.memoryos.app.data.api.MemoryOsApi
import com.memoryos.app.data.db.MemoryOsDatabase
import com.memoryos.app.util.TokenManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    @Provides
    @Singleton
    fun provideGson(): Gson = Gson()

    @Provides
    @Singleton
    fun provideTokenManager(@ApplicationContext context: Context): TokenManager {
        return TokenManager(context)
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(tokenManager: TokenManager): OkHttpClient {
        return OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(AuthInterceptor(tokenManager))
            .addNetworkInterceptor(LoggingInterceptor())
            .build()
    }

    @Provides
    @Singleton
    fun provideMemoryOsApi(okHttpClient: OkHttpClient, gson: Gson): MemoryOsApi {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()
            .create(MemoryOsApi::class.java)
    }
}

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): MemoryOsDatabase {
        return MemoryOsDatabase.getInstance(context)
    }

    @Provides
    @Singleton
    fun provideItemDao(database: MemoryOsDatabase) = database.itemDao()
}
