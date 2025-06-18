# Grid View Implementation Plan for Comment Form

## Overview
Add a grid view option to `/app/active/comment-form/page.tsx` that displays prospects in an alphabetically ordered grid layout, allowing users to select prospects to submit comment forms.

## Current State Analysis

### Existing Comment Form Structure
- Uses `InterviewSearchBar` for prospect selection
- Single prospect selection workflow
- Form fields: interaction (Good/Neutral/Bad), invite (Yes/No/N/A), comment textarea
- Manual prospect entry option with checkbox
- Simple linear layout

### Design References from Existing App
1. **Case Study Portal** (`/app/active/case/page.tsx`):
   - Toggle between "Multiple Forms" and "Single Form" modes
   - Clean button-based mode switching
   - Consistent styling with blue/green accent colors

2. **Multiple Case Study Manager** (`/components/MultipleCaseStudyManager.tsx`):
   - Grid-like tab interface for multiple forms
   - Dark theme with gray-800 backgrounds
   - Status indicators and badges

3. **PastActiveSubmission** (`/components/PastActiveSubmission.tsx`):
   - Card-based layout with prospect information
   - Status badges and consistent spacing
   - Uses `mx-4 my-2 p-3 rounded-lg bg-gray-800 border border-gray-700`

## Implementation Plan

### Phase 1: View Mode Toggle
**File**: `/app/active/comment-form/page.tsx`

**Changes**:
1. Add state for view mode: `const [viewMode, setViewMode] = useState<'search' | 'grid'>('search')`
2. Add view toggle buttons similar to case study portal:
   ```jsx
   <div className="flex gap-4">
     <button className="rounded bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 transition-colors">
       Search View
     </button>
     <button className="rounded bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors">
       Grid View
     </button>
   </div>
   ```

### Phase 2: Prospects Data Fetching
**File**: `/app/supabase/getUsers.ts`

**Changes**:
1. Create new function `getAllProspectsForComments()`:
   - Query all prospects (non-active, non-PIC users)
   - Return: `{ id, full_name, email }[]`
   - Apply same filtering logic as existing functions
   - Sort alphabetically by `full_name`

**File**: `/app/active/comment-form/page.tsx`

**Changes**:
1. Add React Query hook for fetching prospects:
   ```jsx
   const { data: prospects, isLoading: prospectsLoading } = useQuery({
     queryKey: ['allProspects'],
     queryFn: getAllProspectsForComments,
     enabled: viewMode === 'grid'
   });
   ```

### Phase 3: Grid Component Creation
**File**: `/components/ProspectGrid.tsx` (new)

**Structure**:
```jsx
interface ProspectGridProps {
  prospects: Array<{id: string, full_name: string, email: string}>;
  selectedProspect: ProspectInterview | null;
  onSelectProspect: (prospect: ProspectInterview) => void;
}

export default function ProspectGrid({ prospects, selectedProspect, onSelectProspect }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {prospects.map(prospect => (
        <ProspectCard 
          key={prospect.id}
          prospect={prospect}
          isSelected={selectedProspect?.id === prospect.id}
          onClick={() => onSelectProspect(prospect)}
        />
      ))}
    </div>
  );
}
```

### Phase 4: Prospect Card Component
**File**: `/components/ProspectCard.tsx` (new)

**Design Specifications**:
- **Base Style**: `bg-gray-800 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-200`
- **Hover State**: `hover:bg-gray-700 hover:border-gray-600`
- **Selected State**: `bg-blue-900 border-blue-600 ring-2 ring-blue-500`
- **Content**: 
  - Prospect name (truncated if long)
  - Email (smaller, muted)
  - Optional status indicator if they have existing comments

**Structure**:
```jsx
interface ProspectCardProps {
  prospect: {id: string, full_name: string, email: string};
  isSelected: boolean;
  onClick: () => void;
  hasExistingComment?: boolean;
}
```

### Phase 5: Search and Filter Enhancement
**File**: `/components/ProspectGrid.tsx`

**Features**:
1. Search bar within grid view:
   - Filter prospects by name or email
   - Real-time filtering as user types
   - Preserve alphabetical order

2. Optional filters:
   - "Has existing comments" toggle
   - Letter-based quick navigation (A-Z buttons)

### Phase 6: Integration with Comment Form
**File**: `/app/active/comment-form/page.tsx`

**Changes**:
1. Conditional rendering based on `viewMode`
2. Grid view shows prospect selection first, then form
3. Form submission flow remains identical
4. Add "Back to Grid" option when prospect is selected in grid mode

### Phase 7: Responsive Design & Polish
**Responsive Breakpoints**:
- Mobile (sm): 1-2 columns
- Tablet (md): 3 columns  
- Desktop (lg): 4 columns
- Large (xl): 5-6 columns

**Additional Features**:
- Loading states for grid
- Empty state messaging
- Keyboard navigation support
- Accessibility improvements

## File Structure Summary

### New Files
- `/components/ProspectGrid.tsx` - Main grid container
- `/components/ProspectCard.tsx` - Individual prospect cards

### Modified Files
- `/app/active/comment-form/page.tsx` - Main page with view toggle
- `/app/supabase/getUsers.ts` - Add prospects fetching function

## Design Consistency

### Color Scheme (following app patterns)
- **Background**: `bg-gray-800`, `bg-gray-900`
- **Borders**: `border-gray-700`, `border-gray-600`
- **Primary Actions**: `bg-blue-600`, `hover:bg-blue-700`
- **Secondary Actions**: `bg-green-600`, `hover:bg-green-700`
- **Selected State**: `bg-blue-900`, `border-blue-600`
- **Text**: `text-white`, `text-gray-200`, `text-gray-400`

### Typography
- **Main Text**: GeistSans (default app font)
- **Prospect Names**: `text-white font-medium`
- **Emails**: `text-gray-400 text-sm`
- **Buttons**: `font-semibold`

### Spacing & Layout
- **Grid Gap**: `gap-4`
- **Card Padding**: `p-4`
- **Margins**: Following `mx-4 my-2` pattern from existing components
- **Border Radius**: `rounded-lg` consistently

## Technical Considerations

### Performance
- Use React Query for caching prospects data
- Implement virtualization if prospect list is very large (>1000)
- Debounce search input for filtering

### Accessibility
- Proper ARIA labels for grid navigation
- Keyboard support for card selection
- Screen reader friendly prospect information

### State Management
- Maintain existing `useSelectedProspect` hook
- Add view mode state
- Preserve form data when switching between views

## Implementation Timeline

1. **Phase 1-2**: View toggle and data fetching (30 min)
2. **Phase 3-4**: Grid and card components (45 min)
3. **Phase 5**: Search and filtering (30 min)
4. **Phase 6**: Integration with form (30 min)
5. **Phase 7**: Polish and responsive design (30 min)

**Total Estimated Time**: ~3 hours

## Success Criteria

- ✅ Users can toggle between search and grid views
- ✅ Grid displays all prospects alphabetically
- ✅ Prospect selection works in both views
- ✅ Form submission flow is identical in both views
- ✅ Responsive design works on all screen sizes
- ✅ Consistent with existing app design language
- ✅ Performance is acceptable with large prospect lists
- ✅ Accessibility standards are met