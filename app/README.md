# Memory OS Android App

A complete Android client for the Memory OS knowledge management platform built with Kotlin, Jetpack Compose, and Material Design 3.

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Secure token storage with encrypted SharedPreferences

### Core Features
- **Dashboard/Home**: Overview of recent items, stats, and quick access
- **Items Management**: Create, read, update, delete items with full metadata
- **Collections**: Organize items into collections with sharing and collaboration
- **Feed**: View shared items from the community
- **Review**: Spaced repetition system for learning
- **Search**: Global search across all content
- **Teams**: Create and manage teams with shared resources
- **Settings**: User preferences and account management

### Technical Stack
- **Language**: Kotlin
- **UI Framework**: Jetpack Compose with Material Design 3
- **Architecture**: MVVM with Repository Pattern
- **DI**: Hilt
- **Networking**: Retrofit + OkHttp
- **Local Database**: Room (SQLite)
- **Secure Storage**: DataStore + Security Crypto
- **Navigation**: Jetpack Navigation Compose
- **Async**: Coroutines + Flow

## Project Structure

```
app/
├── app/src/main/
│   ├── java/com/memoryos/app/
│   │   ├── data/
│   │   │   ├── api/          # Retrofit API service & interceptors
│   │   │   ├── db/           # Room database, DAOs, TypeConverters
│   │   │   ├── model/        # Data models (Item, Collection, User, etc.)
│   │   │   └── repository/   # Repository layer for data access
│   │   ├── di/               # Hilt dependency injection modules
│   │   ├── ui/
│   │   │   ├── auth/         # Login & Register screens
│   │   │   ├── home/         # Dashboard/Home screen
│   │   │   ├── items/        # Items list and detail screens
│   │   │   ├── collections/  # Collections screens
│   │   │   ├── feed/         # Feed screen
│   │   │   ├── review/       # Spaced repetition screen
│   │   │   ├── teams/        # Teams screens
│   │   │   ├── settings/     # Settings screen
│   │   │   ├── search/       # Search screen
│   │   │   ├── theme/        # Material Design 3 theme
│   │   │   ├── components/   # Reusable UI components
│   │   │   ├── navigation/   # Navigation setup
│   │   │   └── MemoryOSAppRoot.kt  # App root with bottom nav
│   │   ├── util/             # Utilities (TokenManager, etc.)
│   │   ├── MainActivity.kt    # Entry point
│   │   └── MemoryOSApp.kt     # Application class with Hilt
│   └── res/                  # Resources (colors, strings, themes)
├── build.gradle.kts    # App-level build configuration
└── settings.gradle.kts # Project settings

gradle/wrapper/        # Gradle wrapper
```

## API Integration

The app connects to your Memory OS backend API endpoints:
- `/api/auth/*` - Authentication
- `/api/items/*` - Items CRUD and management
- `/api/collections/*` - Collections management
- `/api/review/*` - Spaced repetition
- `/api/teams/*` - Team management
- `/api/comments/*` - Comments
- `/api/search/*` - Search functionality
- `/api/feed/*` - Public feed
- And more...

## Setup

### Prerequisites
- Android Studio Hedgehog or later
- JDK 17 or later
- Kotlin 1.9.22 or later

### Configuration

1. Update the API base URL in `build.gradle.kts`:
   ```kotlin
   buildConfig Field:
   - Debug: http://10.0.2.2:3000/api/ (for emulator)
   - Release: https://your-production-url.com/api/
   ```

2. Configure Network Security in `network_security_config.xml` for your server

### Building

```bash
# Build debug APK
./gradlew build

# Build release APK
./gradlew build --build-type release

# Run on emulator
./gradlew installDebug

# Run tests
./gradlew test
```

## Key Implementation Details

### Authentication Flow
1. User enters email/password
2. AuthViewModel calls AuthRepository.login()
3. API returns JWT token
4. Token stored securely with TokenManager
5. Token added to all subsequent requests via AuthInterceptor

### Data Caching
- ItemDao caches items locally in SQLite
- Room TypeConverters handle complex types (Lists, Maps, etc.)
- Repositories sync remote data with local DB

### State Management
- MutableStateFlow for reactive updates
- ViewModels manage UI state
- Compose recomposes on state changes

### Theme
- Material Design 3 with custom colors
- Dark mode by default
- Dynamic color support
- Custom typography scaling

## Next Steps to Complete

1. Update `MainActivity.kt` to properly check login status on app launch
2. Implement all "TODO" items in UI screens (create item form, edit functionality, etc.)
3. Add image loading with Coil for item thumbnails and favicons
4. Implement push notifications for reminders
5. Add offline support with periodic sync
6. Add swipe-to-refresh on list screens
7. Implement filtering and advanced search UI
8. Add animation transitions between screens
9. Create bottom sheet dialogs for quick actions
10. Add accessibility features (content descriptions, keyboard navigation)

## API Response Handling

All API calls return `Result<T>`:
- `onSuccess { data -> }` - Handle success
- `onFailure { error -> }` - Handle errors

Repositories handle mapping errors to user-friendly messages.

## Database Queries

Common Room queries:
- `getItems(limit, offset)` - Paginated items
- `getFavoriteItems()` - Favorite items as Flow
- `getPendingTasks()` - Tasks not done
- `getItemsByCollection(id)` - Filter by collection
- `getItemsByType(type)` - Filter by type

## Testing

The app includes test infrastructure with JUnit and Espresso. Add tests for:
- API interceptors
- ViewModel state management
- Repository data transformation
- Compose UI components

## Troubleshooting

### API Connection Issues
- Check `BASE_URL` in `build.gradle.kts`
- Verify Network Security Config allows your server
- Check AuthInterceptor is adding tokens correctly

### Database Issues
- Room handles schema versioning in `MemoryOsDatabase`
- Clear app data to reset local DB
- Check TypeConverters for JSON serialization issues

### State Management
- Use `collectAsState()` in Compose
- Check StateFlow emissions in ViewModels
- Verify LaunchedEffect triggers for API calls

## License

Part of Memory OS project
