// Manual test verification
// The changes move drag event listeners from:
// - picker element (small 20px handle at bottom)
// - to picture element (full 150px+ shutter canvas)
// This dramatically improves usability and user experience

// Code changes made:
// 1. picker.addEventListener -> picture.addEventListener (3 events)
// 2. Added cursor: pointer CSS to picture element
