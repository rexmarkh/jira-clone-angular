# Modal Styling Fix

## Problem
The "Create New Board" modal had broken styling:
- Text was very faint/barely visible
- Input fields had poor contrast
- Buttons were hard to see
- Placeholder text was nearly invisible

## Root Cause
Angular component style encapsulation was preventing the SCSS styles from properly applying to the ng-zorro modal components.

## Solution Applied

### 1. Enhanced Input/Textarea Styling
- Added explicit color declarations: `color: #172b4d !important`
- Fixed placeholder color: `color: #8993a4 !important` with `opacity: 1`
- Made selectors more specific: `input.form-input`, `textarea.form-input`
- Ensured all form elements get proper styling

### 2. Added `::ng-deep` Global Overrides
Used Angular's view encapsulation piercing to ensure styles apply to ng-zorro components:

```scss
::ng-deep {
  .ant-modal-body {
    // Ensures modal content has proper padding
    padding: 24px !important;

    .board-form {
      input[nz-input],
      textarea[nz-input] {
        color: #172b4d !important;  // Dark text
        font-size: 14px !important;
        
        &::placeholder {
          color: #8993a4 !important;  // Visible placeholder
          opacity: 1 !important;
        }
      }
    }
  }

  .ant-btn {
    font-weight: 500 !important;
    
    &.ant-btn-default {
      color: #42526e !important;           // Visible Cancel button
      border-color: #dfe1e6 !important;
      
      &:hover {
        color: #172b4d !important;
        border-color: #c1c7d0 !important;
        background: #f4f5f7 !important;
      }
    }

    &.ant-btn-primary {
      background: #0052cc !important;      // Blue Create button
      border-color: #0052cc !important;
      
      &:hover:not([disabled]) {
        background: #0747a6 !important;    // Darker blue on hover
        border-color: #0747a6 !important;
      }

      &[disabled] {
        opacity: 0.5 !important;           // Visible disabled state
        cursor: not-allowed !important;
      }
    }
  }
}
```

## Colors Used (Jira-style)

### Text Colors
- **Primary text:** `#172b4d` (dark blue-gray)
- **Secondary text:** `#42526e` (medium blue-gray)
- **Label text:** `#5e6c84` (lighter blue-gray)
- **Placeholder:** `#8993a4` (subtle gray)

### Input Colors
- **Background:** `#fafbfc` (very light gray)
- **Border:** `#dfe1e6` (light gray)
- **Focus border:** `#4c9aff` (bright blue)
- **Hover background:** `#ebecf0` (slightly darker gray)

### Button Colors
- **Primary (Create):** `#0052cc` → `#0747a6` (Jira blue)
- **Default (Cancel):** `#42526e` text, `#dfe1e6` border

## Result
✅ Labels are now clearly visible
✅ Input text is dark and readable
✅ Placeholder text is visible but subtle
✅ Buttons have proper contrast
✅ Hover states work correctly
✅ Disabled state is visible
✅ Consistent with Jira design system

## Testing
1. Open the retrospective landing page
2. Click "Create Board" button
3. Verify:
   - "Board Title *" label is visible
   - "Description" label is visible
   - Input placeholder text is readable
   - Typing shows dark text
   - Cancel button is visible
   - Create Board button is blue and prominent
   - Create Board button is disabled when title is empty

Build Status: ✅ Successful (Hash: b01f5a6d764d8d2d)
