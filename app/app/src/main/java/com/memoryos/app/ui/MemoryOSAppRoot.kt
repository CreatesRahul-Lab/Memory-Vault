package com.memoryos.app.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CollectionsBookmark
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.RateReview
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.memoryos.app.ui.collections.CollectionsListScreen
import com.memoryos.app.ui.feed.FeedScreen
import com.memoryos.app.ui.home.HomeScreen
import com.memoryos.app.ui.items.ItemDetailScreen
import com.memoryos.app.ui.items.ItemsListScreen
import com.memoryos.app.ui.review.ReviewScreen
import com.memoryos.app.ui.search.SearchScreen
import com.memoryos.app.ui.settings.SettingsScreen
import com.memoryos.app.ui.teams.TeamsListScreen
import com.memoryos.app.ui.auth.LoginScreen
import com.memoryos.app.ui.auth.RegisterScreen
import com.memoryos.app.util.TokenManager
import dagger.hilt.android.EntryPointAccessors
import androidx.compose.ui.platform.LocalContext

sealed class BottomNavItem(val route: String, val label: String, val icon: ImageVector) {
    object Home : BottomNavItem("home", "Home", Icons.Default.Home)
    object Items : BottomNavItem("items", "Items", Icons.Default.List)
    object Collections : BottomNavItem("collections", "Collections", Icons.Default.CollectionsBookmark)
    object Review : BottomNavItem("review", "Review", Icons.Default.RateReview)
    object Search : BottomNavItem("search", "Search", Icons.Default.Search)
    object Settings : BottomNavItem("settings", "Settings", Icons.Default.Settings)
}

@Composable
fun MemoryOSAppRoot() {
    val context = LocalContext.current
    val tokenManager = remember {
        TokenManager(context)
    }
    var isLoggedIn by remember { mutableStateOf(tokenManager.isLoggedIn()) }
    val navController = rememberNavController()

    if (!isLoggedIn) {
        AuthNavGraph(navController) {
            isLoggedIn = true
        }
    } else {
        AppNavGraph(navController) {
            isLoggedIn = false
        }
    }
}

@Composable
private fun AuthNavGraph(navController: NavHostController, onLoginSuccess: () -> Unit) {
    NavHost(navController, startDestination = "login") {
        composable("login") {
            LoginScreen(
                onLoginSuccess = onLoginSuccess,
                onNavigateToRegister = { navController.navigate("register") }
            )
        }
        composable("register") {
            RegisterScreen(
                onRegisterSuccess = onLoginSuccess,
                onNavigateToLogin = { navController.popBackStack() }
            )
        }
    }
}

@Composable
private fun AppNavGraph(navController: NavHostController, onLogout: () -> Unit) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    // Hide bottom bar on detail screens
    val showBottomBar = currentRoute in listOf(
        BottomNavItem.Home.route,
        BottomNavItem.Items.route,
        BottomNavItem.Collections.route,
        BottomNavItem.Review.route,
        BottomNavItem.Search.route,
        BottomNavItem.Settings.route
    )

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                BottomNavigationBar(
                    selectedRoute = currentRoute ?: BottomNavItem.Home.route,
                    onNavItemSelected = { route ->
                        navController.navigate(route) {
                            popUpTo(BottomNavItem.Home.route) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            NavHost(navController, startDestination = BottomNavItem.Home.route) {
                composable(BottomNavItem.Home.route) {
                    HomeScreen(
                        onItemClick = { itemId ->
                            navController.navigate("item/$itemId")
                        },
                        onNavigateToItems = {
                            navController.navigate(BottomNavItem.Items.route) {
                                popUpTo(BottomNavItem.Home.route) { saveState = true }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
                composable(BottomNavItem.Items.route) {
                    ItemsListScreen(
                        onItemClick = { itemId ->
                            navController.navigate("item/$itemId")
                        },
                        onCreateClick = { /* TODO: Create item screen */ }
                    )
                }
                composable("item/{itemId}") { backStackEntry ->
                    val itemId = backStackEntry.arguments?.getString("itemId") ?: return@composable
                    ItemDetailScreen(
                        itemId = itemId,
                        onBack = { navController.popBackStack() }
                    )
                }
                composable(BottomNavItem.Collections.route) {
                    CollectionsListScreen(
                        onCollectionClick = { /* TODO */ },
                        onCreateClick = { /* TODO */ }
                    )
                }
                composable(BottomNavItem.Review.route) {
                    ReviewScreen()
                }
                composable(BottomNavItem.Search.route) {
                    SearchScreen()
                }
                composable(BottomNavItem.Settings.route) {
                    SettingsScreen(
                        onLogout = onLogout
                    )
                }
            }
        }
    }
}

@Composable
private fun BottomNavigationBar(
    selectedRoute: String,
    onNavItemSelected: (String) -> Unit
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface
    ) {
        val items = listOf(
            BottomNavItem.Home,
            BottomNavItem.Items,
            BottomNavItem.Collections,
            BottomNavItem.Review,
            BottomNavItem.Search,
            BottomNavItem.Settings
        )

        items.forEach { item ->
            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.label) },
                label = { Text(item.label) },
                selected = selectedRoute == item.route,
                onClick = { onNavItemSelected(item.route) }
            )
        }
    }
}
