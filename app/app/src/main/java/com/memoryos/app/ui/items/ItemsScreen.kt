package com.memoryos.app.ui.items

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.memoryos.app.data.model.Item
import com.memoryos.app.ui.components.*

data class ItemsState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val items: List<Item> = emptyList(),
    val totalItems: Int = 0,
    val currentPage: Int = 1,
    val pages: Int = 1
)

@Composable
fun ItemsListScreen(
    onItemClick: (String) -> Unit,
    onCreateClick: () -> Unit,
    viewModel: ItemsViewModel = hiltViewModel()
) {
    val state by viewModel.itemsState.collectAsState()
    var searchQuery by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        viewModel.loadItems()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                "Items",
                style = MaterialTheme.typography.displaySmall,
                color = MaterialTheme.colorScheme.primary
            )
            FloatingActionButton(
                onClick = onCreateClick,
                containerColor = MaterialTheme.colorScheme.primary
            ) {
                Icon(Icons.Default.Add, "Create item")
            }
        }

        SearchField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            onSearch = { viewModel.searchItems(searchQuery) }
        )

        Spacer(modifier = Modifier.height(16.dp))

        if (state.error != null) {
            ErrorMessage(state.error!!)
        }

        if (state.isLoading) {
            LoadingIndicator()
        } else if (state.items.isEmpty()) {
            EmptyState("No items found. Create your first item!")
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(state.items) { item ->
                    ItemCard(
                        title = item.title,
                        description = item.description,
                        url = item.url,
                        type = item.type,
                        favorite = item.favorite,
                        onFavoriteClick = { viewModel.toggleFavorite(item.id) },
                        onClick = { onItemClick(item.id) }
                    )
                }
            }
        }
    }
}

@Composable
fun ItemDetailScreen(
    itemId: String,
    onBack: () -> Unit,
    viewModel: ItemsViewModel = hiltViewModel()
) {
    val state by viewModel.itemDetailState.collectAsState()

    LaunchedEffect(itemId) {
        viewModel.loadItemDetail(itemId)
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Button(onClick = onBack) {
            Text("< Back")
        }

        if (state.error != null) {
            ErrorMessage(state.error!!)
        }

        if (state.isLoading) {
            LoadingIndicator()
        } else if (state.item != null) {
            val item = state.item!!
            LazyColumn {
                item {
                    Text(
                        item.title,
                        style = MaterialTheme.typography.displaySmall,
                        modifier = Modifier.padding(bottom = 16.dp)
                    )
                }

                if (!item.url.isEmpty()) {
                    item {
                        Text(
                            "URL",
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Text(
                            item.url,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.primary
                        )
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                if (!item.description.isNullOrEmpty()) {
                    item {
                        Text(
                            "Description",
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Text(item.description!!, style = MaterialTheme.typography.bodyMedium)
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                if (!item.summary.isNullOrEmpty()) {
                    item {
                        Text(
                            "AI Summary",
                            style = MaterialTheme.typography.titleMedium,
                            modifier = Modifier.padding(bottom = 8.dp)
                        )
                        Text(item.summary!!, style = MaterialTheme.typography.bodyMedium)
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }

                item {
                    Button(
                        onClick = { viewModel.deleteItem(itemId) },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Delete")
                    }
                }
            }
        }
    }
}
