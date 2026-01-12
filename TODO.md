# TODO - Pull-to-Refresh from Header Implementation

## Step 1: Add refresh EventEmitter to HeaderComponent
- [x] Add `@Output() refreshApp: EventEmitter<void>` to header.component.ts
- [x] Add `onPullRefresh()` method to emit the event
- [x] Add touch event listeners for pull/jale detection (touchstart, touchend)
- [x] Update header.component.html to trigger refresh on pull/jale action

## Step 2: Update HomeComponent to handle refresh
- [x] Add `@Output() refreshCasProducts: EventEmitter<void>` to home.component.ts
- [x] Add method to pass refresh to CasProductsComponent (onRefreshFromHeader)
- [x] Update home.component.html to bind refresh events

## Step 3: Update CasProductsComponent to respond to refresh
- [x] Add `@Input() refreshCasProducts: EventEmitter<void>` to cas-products.component.ts
- [x] Subscribe to refreshCasProducts in ngOnInit to call refreshData()

## Step 4: Test the implementation
- [ ] Verify header pull/jale triggers refresh
- [ ] Verify products are refreshed in home

---

## Summary of Changes:

### HeaderComponent (header.component.ts)
- Added `@Output() refreshApp: EventEmitter<void>` 
- Added touch event listeners (`touchstart`, `touchend`) to detect pull gestures
- Added `onPullRefresh()` method that emits when pull is detected

### HomeComponent (home.component.ts)
- Added `@Output() refreshCasProducts: EventEmitter<void>`
- Added `onRefreshFromHeader()` method to relay refresh events

### CasProductsComponent (cas-products.component.ts)
- Added `@Input() refreshCasProducts: EventEmitter<void>`
- Subscribed to the event in ngOnInit to call `refreshData()`

### Templates (home.component.html)
- Bound `(refreshApp)` output from header to home's `onRefreshFromHeader()`
- Bound `[refreshCasProducts]` to cas-products component

