# Profile Component

A reusable profile component that displays user information with various customization options for different use cases throughout the application.

## Features

- **Flexible Display Options**: Simple avatar, avatar with tooltip, or detailed profile information
- **Customizable Sizing**: Support for different avatar sizes (24px, 26px, 32px, 40px, 48px, etc.)
- **Rich Tooltips**: Displays detailed user information including name, email, assigned issues count, and member since date
- **Interactive Elements**: Clickable profile with customizable click handlers
- **Responsive Design**: Works well on different screen sizes
- **Accessibility**: Proper semantic markup with ARIA labels

## Usage

### Basic Avatar (Simple)
```html
<app-profile 
  [showTooltip]="false" 
  [size]="32">
</app-profile>
```

### Avatar with Detailed Tooltip (Navbar Style)
```html
<app-profile 
  [showTooltip]="true" 
  [size]="26" 
  [clickable]="true">
</app-profile>
```

### With Specific User Data
```html
<app-profile 
  [user]="specificUser"
  [showTooltip]="true" 
  [size]="40">
</app-profile>
```

## Component Inputs

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `user` | `JUser \| null` | `null` | Specific user to display. If not provided, uses current authenticated user |
| `showTooltip` | `boolean` | `true` | Whether to show detailed tooltip on hover |
| `size` | `number` | `26` | Avatar size in pixels |
| `clickable` | `boolean` | `true` | Whether the profile is clickable |

## User Interface Features

### Tooltip Content
The detailed tooltip includes:
- **User Avatar**: Large avatar image (40px)
- **Name & Email**: User's full name and email address
- **Statistics**: Number of assigned issues
- **Member Since**: Formatted join date
- **Action Buttons**: View Profile and Settings buttons

### Styling Features
- **Consistent Design**: Matches the application's design system
- **Hover Effects**: Smooth transitions and visual feedback
- **Professional Layout**: Clean, organized information display
- **Responsive**: Adapts to different container sizes

## Implementation Details

### Dependencies
- `@angular/core` - Angular framework
- `ng-zorro-antd/button` - Button components
- `ng-zorro-antd/tooltip` - Tooltip functionality
- `@trungk18/interface/user` - User interface definition
- `@trungk18/project/auth` - Authentication services

### File Structure
```
profile/
├── profile.component.ts       # Component logic
├── profile.component.html     # Template
├── profile.component.scss     # Styles
└── profile-demo.component.ts  # Demo component (optional)
```

### Integration
The ProfileComponent has been integrated into:
- **Navigation Bar**: Left navbar profile display
- **Project Module**: Added to NavigationComponents array
- **Module Imports**: NzButtonModule added for button functionality

## Customization

### Styling Classes
- `.profile-container` - Main container
- `.profile-info` - Tooltip content container
- `.profile-header` - User info header section
- `.profile-stats` - Statistics section
- `.profile-actions` - Action buttons section

### SCSS Variables
The component uses consistent colors from the design system:
- `#172b4d` - Primary text color
- `#6b778c` - Secondary text color
- `#5e6c84` - Muted text color
- `#f4f5f7` - Background color
- `#4c9aff` - Accent color

## Usage Examples

### Navbar Integration
```html
<!-- In navbar-left.component.html -->
<div class="item" *ngIf="authQuery.user$ | async as user">
  <div class="itemIcon">
    <app-profile 
      [user]="user" 
      [showTooltip]="true" 
      [size]="26"
      [clickable]="true">
    </app-profile>
  </div>
</div>
```

### Profile Card Display
```html
<!-- For detailed profile display -->
<app-profile 
  [showTooltip]="false" 
  [size]="60"
  [clickable]="false">
</app-profile>
```

## Future Enhancements

Potential improvements for future versions:
1. **Profile Modal**: Open detailed profile modal on click
2. **Status Indicators**: Online/offline status display  
3. **Role Badges**: Display user roles and permissions
4. **Custom Actions**: Configurable action buttons
5. **Profile Editing**: Inline profile editing capabilities
6. **Avatar Upload**: Direct avatar image upload functionality

## Browser Support

The component supports all modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Lazy Loading**: User data loaded efficiently with observables
- **Change Detection**: OnPush strategy for optimal performance
- **Minimal DOM**: Lightweight template structure
- **CSS Optimization**: Efficient styling with minimal reflows