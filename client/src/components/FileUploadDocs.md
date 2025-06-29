# File Upload Components Documentation

This document describes the different file upload components available in the Encriptofy application.

## Components Overview

### 1. FileUpload (Basic)
A modern file upload component with drag & drop functionality, file validation, and error handling.

### 2. FileUploadAdvanced (Advanced)
An enhanced version with progress tracking, upload status, and better visual feedback.

## Usage Examples

### Basic FileUpload

```jsx
import FileUpload from './components/FileUpload';

function MyComponent() {
  const handleFileSelect = (file) => {
    if (file) {
      console.log('Selected file:', file.name);
      // Process the file
    }
  };

  return (
    <FileUpload
      onFileSelect={handleFileSelect}
      acceptedTypes=".txt,.pdf,.doc,.docx"
      maxSize={5}
      placeholder="Drop your document here"
      subtitle="Supports: TXT, PDF, DOC, DOCX (Max 5MB)"
    />
  );
}
```

### Advanced FileUploadAdvanced

```jsx
import FileUploadAdvanced from './components/FileUploadAdvanced';

function MyComponent() {
  const handleFileSelect = (file) => {
    if (file) {
      console.log('Selected file:', file.name);
      // Process the file
    }
  };

  return (
    <FileUploadAdvanced
      onFileSelect={handleFileSelect}
      acceptedTypes=".jpg,.jpeg,.png,.gif"
      maxSize={10}
      placeholder="Upload your images"
      subtitle="Supports: JPG, PNG, GIF (Max 10MB)"
      showProgress={true}
    />
  );
}
```

## Props Reference

### Common Props (Both Components)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFileSelect` | `function` | Required | Callback function called when a file is selected |
| `acceptedTypes` | `string` | `'*'` | Comma-separated list of accepted file types |
| `maxSize` | `number` | `4` | Maximum file size in MB |
| `multiple` | `boolean` | `false` | Whether to allow multiple file selection |
| `disabled` | `boolean` | `false` | Whether the component is disabled |
| `className` | `string` | `''` | Additional CSS classes |
| `placeholder` | `string` | `'Choose a file or drag it here'` | Custom placeholder text |
| `subtitle` | `string` | `'Maximum file size: 4MB'` | Custom subtitle text |

### Advanced Props (FileUploadAdvanced Only)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `loading` | `boolean` | `false` | Whether to show loading state |
| `showProgress` | `boolean` | `true` | Whether to show progress bar |

## Features

### FileUpload (Basic)
- ✅ Drag & drop support
- ✅ File validation (size and type)
- ✅ Error handling with user-friendly messages
- ✅ File type icons
- ✅ Responsive design
- ✅ Accessibility support

### FileUploadAdvanced (Enhanced)
- ✅ All features from basic version
- ✅ Progress tracking with animated progress bar
- ✅ Upload status indicators
- ✅ Enhanced animations and transitions
- ✅ Better visual feedback
- ✅ Loading states
- ✅ Success/error states

## File Type Icons

The components automatically display appropriate icons based on file extensions:

- **PDF**: Red PDF icon
- **Word Documents**: Blue Word icon
- **Excel Files**: Green Excel icon
- **Images**: Purple image icon
- **Archives**: Orange archive icon
- **Text Files**: Gray text icon
- **JSON**: Yellow text icon
- **CSV**: Green text icon
- **Others**: Generic file icon

## Styling

Both components use Tailwind CSS classes and are fully responsive. They follow the application's design system with:

- Rounded corners (`rounded-xl`)
- Smooth transitions (`transition-all duration-300`)
- Hover effects
- Focus states
- Error states with red styling
- Success states with green styling

## Error Handling

The components handle various error scenarios:

- **File too large**: Shows error message with size limit
- **Invalid file type**: Shows error message with accepted types
- **Upload failure**: Shows error message with retry option

## Accessibility

Both components are built with accessibility in mind:

- Proper ARIA labels
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Error announcements

## Best Practices

1. **Always validate files** on the server side as well
2. **Provide clear feedback** to users about file requirements
3. **Handle errors gracefully** with user-friendly messages
4. **Use appropriate file size limits** based on your use case
5. **Consider file type restrictions** for security
6. **Test with different file types** and sizes
7. **Ensure responsive design** works on all devices

## Examples in the Application

The file upload components are currently used in:

- **DashboardPage**: For file encryption/decryption
- **FileUploadDemo**: Component showcase and testing

## Customization

You can customize the components by:

1. **Modifying the styling** using Tailwind classes
2. **Adding custom validation** logic
3. **Extending the file type icons** mapping
4. **Customizing the progress animation**
5. **Adding additional features** like file preview

## Troubleshooting

### Common Issues

1. **File not selecting**: Check if `onFileSelect` callback is properly defined
2. **Validation not working**: Verify `acceptedTypes` and `maxSize` props
3. **Styling issues**: Ensure Tailwind CSS is properly configured
4. **Progress not showing**: Check if `showProgress` prop is set to `true`

### Debug Tips

- Check browser console for errors
- Verify file input is not hidden by other elements
- Test with different file types and sizes
- Ensure proper event handling 