package com.memoryos.app.ui.home

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.memoryos.app.data.model.Item
import com.memoryos.app.ui.components.ErrorMessage
import com.memoryos.app.ui.components.ItemCard
import com.memoryos.app.ui.components.LoadingIndicator
import kotlinx.coroutines.flow.StateFlow

data class HomeState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val recentItems: List<Item> = emptyList(),
    val totalItems: Int = 0,
    val favoriteCount: Int = 0,
    val pendingReviewCount: Int = 0
)

@Composable
fun HomeScreen(
    onItemClick: (String) -> Unit,
    onNavigateToItems: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val state by viewModel.homeState.collectAsState()

    LaunchedEffect(Unit) {
        viewModel.loadDashboard()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            "Home",
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary,
            modifier = Modifier.padding(bottom = 24.dp)
        )

        if (state.error != null) {
            ErrorMessage(state.error!!)
            Spacer(modifier = Modifier.height(16.dp))
        }

        if (state.isLoading) {
            LoadingIndicator()
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Statistics cards
                items(1) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        StatCard(
                            title = "Total Items",
                            value = state.totalItems.toString(),
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "Favorites",
                            value = state.favoriteCount.toString(),
                            modifier = Modifier.weight(1f)
                        )
                        StatCard(
                            title = "To Review",
                            value = state.pendingReviewCount.toString(),
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                item {
                    Text(
                        "Recent Items",
                        style = MaterialTheme.typography.titleLarge,
                        modifier = Modifier.padding(top = 24.dp, bottom = 12.dp)
                    )
                }

                if (state.recentItems.isEmpty()) {
                    item {
                        Text(
                            "No items yet. Create your first item!",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                        )
                    }
                } else {
                    items(state.recentItems) { item ->
                        ItemCard(
                            title = item.title,
                            description = item.description,
                            url = item.url,
                            type = item.type,
                            favorite = item.favorite,
                            onClick = { onItemClick(item.id) }
                        )
                    }
                }

                item {
                    Button(
                        onClick = onNavigateToItems,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(top = 16.dp)
                    ) {
                        Text("View All Items")
                    }
                }
            }
        }
    }
}

@Composable
fun StatCard(title: String, value: String, modifier: Modifier = Modifier) {
    Card(
        modifier = modifier.height(100.dp),
        shape = RoundedCornerShape(8.dp),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                title,
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
            )
            Text(
                value,
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}
