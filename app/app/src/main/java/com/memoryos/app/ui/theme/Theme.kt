package com.memoryos.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// Colors
val Primary = Color(0xFFE8B931)
val PrimaryDark = Color(0xFFC49A1A)
val Background = Color(0xFF1A1A2E)
val Surface = Color(0xFF16213E)
val OnSurface = Color(0xFFFFFFFF)
val Error = Color(0xFFFF6B6B)
val Success = Color(0xFF51CF66)
val Warning = Color(0xFFFFC93C)
val Info = Color(0xFF4D96FF)

private val DarkColorScheme = darkColorScheme(
    primary = Primary,
    secondary = PrimaryDark,
    tertiary = Surface,
    background = Background,
    surface = Surface,
    onSurface = OnSurface,
    error = Error,
    errorContainer = Error,
    onError = Color.White
)

private val LightColorScheme = lightColorScheme(
    primary = Primary,
    secondary = PrimaryDark,
    tertiary = Surface,
    background = Color.White,
    surface = Color(0xFFF5F5F5),
    onSurface = Color(0xFF1A1A2E),
    error = Error
)

@Composable
fun MemoryOSTheme(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AppTypography,
        content = content
    )
}
