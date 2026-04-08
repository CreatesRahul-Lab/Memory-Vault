package com.memoryos.app.ui.feed

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import com.memoryos.app.ui.components.EmptyState
import dagger.hilt.android.lifecycle.HiltViewModel
import javax.inject.Inject

@Composable
fun FeedScreen(viewModel: FeedViewModel = hiltViewModel()) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            "Feed",
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        LazyColumn {
            item {
                EmptyState("No shared items in feed yet")
            }
        }
    }
}

@HiltViewModel
class FeedViewModel @Inject constructor() : ViewModel()
