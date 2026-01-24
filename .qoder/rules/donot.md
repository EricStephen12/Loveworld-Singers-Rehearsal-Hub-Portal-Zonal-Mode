---
trigger: always_on
---
# Universal AI Coding Rules

Copy and paste this at the start of ANY project prompt to ensure clean, human-style code.

---

## 🎯 MANDATORY CODE STYLE RULES

```
CRITICAL CODE STYLE REQUIREMENTS:

You are an experienced senior developer who values simplicity and readability.
Write code that looks human-written, not AI-generated.

NAMING CONVENTIONS:
✅ DO: Use concise, clear names
   - Functions: login(), fetchUser(), saveData()
   - Variables: user, data, error, isLoading
   - Components: UserCard, LoginForm, Dashboard
   - Files: auth.ts, userService.ts, utils.ts

❌ DON'T: Use verbose, overly descriptive names
   - handleUserAuthenticationProcess() ❌
   - currentlyAuthenticatedUserData ❌
   - performDatabaseQueryOperation() ❌
   - executeAsyncFetchRequest() ❌

FUNCTION LENGTH:
✅ Keep functions under 30 lines
✅ If longer, split into smaller functions
✅ One function = one clear purpose
❌ No 100+ line functions

COMMENTS:
✅ Only comment WHY, never WHAT
✅ Explain business logic or non-obvious decisions
✅ Example: "VIP users need instant sync" ✅
❌ Never explain what code obviously does
❌ No parameter documentation in comments
❌ No "First we..., then we..., finally we..." patterns
❌ Example: "This function handles authentication" ❌

ERROR HANDLING:
✅ Simple try-catch where needed
✅ Meaningful error messages
❌ No nested try-catch blocks
❌ No overly defensive error checking everywhere
❌ Don't re-throw the same error multiple times

CODE ORGANIZATION:
✅ Extract repeated logic into utilities
✅ Group related code together
✅ Use early returns to reduce nesting
✅ Consistent formatting throughout
❌ No duplicate code
❌ No deeply nested conditionals (max 2-3 levels)

IMPORTS:
✅ Group by source (React, external libs, internal)
✅ Combine imports from same source
✅ Alphabetically sorted within groups
❌ No duplicate imports
❌ No unused imports

EXAMPLES OF GOOD VS BAD:

❌ BAD (AI-generated style):
```javascript
/**
 * This function is responsible for handling the user authentication process
 * It takes the user's email address and password as parameters
 * @param userEmailAddress - The email address provided by the user
 * @param userPasswordString - The password string for authentication
 * @returns Promise<User> - Returns authenticated user object or throws error
 */
async function handleUserAuthenticationProcess(
  userEmailAddress: string,
  userPasswordString: string
): Promise<AuthenticatedUserData> {
  try {
    // First, we need to validate that the email address is provided
    if (!userEmailAddress || userEmailAddress.trim() === '') {
      throw new Error('Email address is required and cannot be empty');
    }
    
    // Next, we validate the password
    if (!userPasswordString || userPasswordString.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    
    // Now we proceed with the authentication process
    try {
      const authenticationResult = await authenticationService.signInWithEmailAndPassword(
        userEmailAddress,
        userPasswordString
      );
      
      // Check if authentication was successful
      if (authenticationResult && authenticationResult.user) {
        return authenticationResult.user;
      } else {
        throw new Error('Authentication failed - no user returned');
      }
    } catch (innerError) {
      console.error('Inner authentication error:', innerError);
      throw innerError;
    }
  } catch (outerError) {
    console.error('Outer authentication error:', outerError);
    throw outerError;
  }
}
```

✅ GOOD (human-written style):
```javascript
async function login(email: string, password: string) {
  if (!email?.trim()) throw new Error('Email required');
  if (password.length < 8) throw new Error('Password too short');
  
  const { user } = await auth.signIn(email, password);
  return user;
}
```

GENERAL PRINCIPLES:
1. Prioritize readability over cleverness
2. Write code that's easy to modify later
3. Use established patterns, don't reinvent
4. Keep it simple - complex code = bugs
5. If you can't explain it simply, simplify it

REMEMBER: You're writing code that OTHER HUMANS will maintain.
Make it easy for them.
```

---

## 📝 SHORT VERSION (For Quick Projects)

```
CODE STYLE RULES:

Write clean, human-style code:
✅ Short functions (under 30 lines)
✅ Concise names: login(), user, fetchData()
✅ Minimal comments (only explain WHY, not WHAT)
✅ Simple error handling (no nested try-catch)
✅ Extract repeated logic

❌ No verbose comments explaining obvious code
❌ No long names: handleUserAuthenticationProcess()
❌ No over-engineering
❌ No AI-style verbosity

Example:
Good: async function login(email, password) { ... }
Bad:  async function handleUserLoginAuthenticationProcess(userEmail, userPass) { ... }

Keep it simple, readable, maintainable.
```

---

## 🔧 LANGUAGE-SPECIFIC ADDITIONS

### For JavaScript/TypeScript:

```
JAVASCRIPT/TYPESCRIPT SPECIFIC:

✅ Use modern syntax (async/await, not .then())
✅ Use const/let, never var
✅ Destructure when it improves readability
✅ Use optional chaining: user?.name
✅ Use nullish coalescing: value ?? default
✅ Arrow functions for callbacks
✅ Template literals for strings
✅ TypeScript: Type what's needed, not everything

❌ No callbacks/promises when async/await is clearer
❌ No any type (use unknown if needed)
❌ No implicit any
❌ No overly complex type gymnastics
```

---

### For React:

```
REACT SPECIFIC:

✅ Functional components (not classes)
✅ Hooks at the top of component
✅ Custom hooks for reusable logic
✅ Destructure props immediately
✅ Early returns for conditional rendering
✅ Use React.memo only when needed
✅ Keep components under 150 lines

❌ No class components unless required
❌ No hooks inside conditions/loops
❌ No prop drilling (use context if needed)
❌ No inline object/array creation in props
❌ No giant components (split them up)

Example:
Good:
```tsx
function UserCard({ user, onDelete }) {
  if (!user) return null;
  
  const handleClick = () => onDelete(user.id);
  
  return (
    <div onClick={handleClick}>
      {user.name}
    </div>
  );
}
```

Bad:
```tsx
function UserCardComponent({ userData, onDeleteCallback }) {
  // Handle the user card display logic
  return (
    <div>
      {/* Display user information */}
      {userData ? (
        <div onClick={() => onDeleteCallback(userData.id)}>
          {/* Show the user's name */}
          {userData.name}
        </div>
      ) : (
        // No user data available
        null
      )}
    </div>
  );
}
```
```

---

### For Python:

```
PYTHON SPECIFIC:

✅ Follow PEP 8 naming: snake_case for functions/variables
✅ Use type hints where helpful
✅ List comprehensions for simple cases
✅ Context managers (with statement)
✅ f-strings for formatting
✅ Descriptive but concise names

❌ No camelCase (use snake_case)
❌ No overly complex list comprehensions
❌ No bare except clauses
❌ No mutable default arguments

Example:
Good:
```python
def get_user(user_id: str) -> User:
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    return user
```

Bad:
```python
def getUserFromDatabaseById(userId: str) -> User:
    """
    This function retrieves a user from the database by their ID
    Args:
        userId: The unique identifier for the user
    Returns:
        User object if found, raises error if not found
    """
    try:
        # Query the database for the user
        userQueryResult = database.query(User).filter_by(id=userId).first()
        
        # Check if user was found
        if userQueryResult is None:
            # User not found, raise error
            raise NotFoundError(f"User with ID {userId} was not found")
        
        # Return the user
        return userQueryResult
    except Exception as e:
        # Handle any errors
        raise e
```
```

---

## 🎨 UI/FRONTEND SPECIFIC

```
UI/FRONTEND CODE:

✅ Semantic HTML elements
✅ Accessibility: aria labels, keyboard navigation
✅ Responsive design (mobile-first)
✅ Consistent spacing/sizing
✅ Loading states for async operations
✅ Error states with helpful messages
✅ Use design system/component library

❌ No div soup (use semantic elements)
❌ No inline styles (use CSS/Tailwind)
❌ No hardcoded colors/sizes
❌ No missing loading/error states
❌ No inaccessible components

Tailwind:
- Use utility classes consistently
- Extract common patterns to components
- Use arbitrary values sparingly: w-[137px] ❌
- Prefer preset values: w-32 ✅
```

---

## 🗄️ BACKEND/API SPECIFIC

```
BACKEND/API CODE:

✅ RESTful conventions or clear API patterns
✅ Input validation on all endpoints
✅ Proper HTTP status codes
✅ Consistent error response format
✅ Authentication/authorization checks
✅ Rate limiting where needed
✅ Logging for debugging

❌ No sensitive data in responses
❌ No SQL injection vulnerabilities
❌ No missing error handling
❌ No exposing stack traces to clients
❌ No missing authentication checks

Example:
Good:
```typescript
export async function POST(req: Request) {
  const { email, password } = await req.json();
  
  if (!email || !password) {
    return Response.json(
      { error: 'Email and password required' },
      { status: 400 }
    );
  }
  
  const user = await login(email, password);
  return Response.json({ user });
}
```
```

---

## 📦 PROJECT STRUCTURE

```
PROJECT ORGANIZATION:

✅ Logical folder structure
✅ Group by feature or domain
✅ Separate concerns (UI, logic, data)
✅ Consistent file naming
✅ Index files for clean imports

❌ No giant files (max 300-400 lines)
❌ No deeply nested folders
❌ No mixing concerns in one file
❌ No inconsistent naming

Example Structure:
```
/src
  /features
    /auth
      Login.tsx
      Signup.tsx
      authService.ts
      types.ts
    /dashboard
      Dashboard.tsx
      dashboardService.ts
  /components
    /ui
      Button.tsx
      Input.tsx
  /lib
    utils.ts
    api.ts
  /types
    index.ts
```
```

---

## 🧪 TESTING CONSIDERATIONS

```
TESTING CODE:

✅ Descriptive test names
✅ Arrange-Act-Assert pattern
✅ Test critical paths first
✅ Mock external dependencies
✅ Keep tests focused and simple

❌ No testing implementation details
❌ No brittle tests (break on small changes)
❌ No overly complex test setup
❌ No tests that test the framework

Example:
Good: test('login fails with invalid credentials')
Bad:  test('test1') or test('it should work')
```

---

## 🔐 SECURITY RULES

```
SECURITY BASICS:

✅ Validate all user input
✅ Use parameterized queries (no SQL injection)
✅ Hash passwords (bcrypt, argon2)
✅ Use HTTPS in production
✅ Sanitize output to prevent XSS
✅ Implement CSRF protection
✅ Use environment variables for secrets

❌ Never commit API keys/secrets
❌ Never trust client-side validation alone
❌ Never store passwords in plain text
❌ Never expose sensitive errors to users
```

---

## ⚡ PERFORMANCE GUIDELINES

```
PERFORMANCE:

✅ Load data only when needed
✅ Cache expensive computations
✅ Lazy load heavy components
✅ Debounce user input
✅ Optimize images
✅ Use pagination for large lists

❌ No unnecessary re-renders
❌ No loading entire dataset at once
❌ No blocking the main thread
❌ No memory leaks (clean up listeners/timers)
```

---

## 📋 COMPREHENSIVE CHECKLIST

```
BEFORE CONSIDERING CODE "DONE":

Readability:
[ ] Function names are clear and concise
[ ] Variable names are descriptive but short
[ ] No comments explaining obvious code
[ ] Code structure is logical and easy to follow
[ ] No functions over 50 lines

Functionality:
[ ] Code works as expected
[ ] Edge cases are handled
[ ] Error messages are helpful
[ ] No console warnings/errors

Quality:
[ ] No duplicate code
[ ] No unused imports/variables
[ ] Consistent formatting
[ ] Proper TypeScript types (if applicable)
[ ] No any types (if TypeScript)

Security:
[ ] User input is validated
[ ] No secrets in code
[ ] Authentication/authorization present
[ ] No security vulnerabilities

Performance:
[ ] No unnecessary re-renders/recalculations
[ ] Efficient algorithms
[ ] Proper loading states
[ ] No memory leaks
```

---

## 💡 QUICK REFERENCE CARD

```
REMEMBER THESE 10 RULES:

1. Functions under 30 lines
2. Concise names (login, not handleUserLoginProcess)
3. Comment WHY, not WHAT
4. Simple error handling (one try-catch max)
5. Extract repeated code
6. Early returns to reduce nesting
7. No verbose AI-style comments
8. Validate user input always
9. Meaningful variable names
10. Keep it simple

If your code needs comments to explain WHAT it does,
the code is too complex - simplify it.
```

---

## 🎯 ONE-LINER TO ADD TO EVERY PROMPT

```
Write clean, production-ready code using senior developer best practices: 
concise names, minimal comments, functions under 30 lines, simple error 
handling, no AI verbosity.
```

---

## 🔥 WHEN TO USE

**Always include these rules when:**
- Starting a new project
- Adding features to existing code
- Asking AI to refactor code
- Code reviewing AI output
- Teaching AI your coding style

**Just copy-paste the relevant section at the start of your prompt!**

---

## ✅ VALIDATION PROMPTS

**To check if AI followed rules:**

```
Review the code you just wrote and check:
1. Are there any verbose comments?
2. Are function names concise?
3. Are any functions over 30 lines?
4. Is there any repeated code?
5. Does it look AI-generated?

If yes to any, refactor to follow clean code principles.
```

**To fix AI-generated code:**

```
This code looks AI-generated. Refactor it to be more human-readable:
- Remove verbose comments
- Shorten function names
- Simplify error handling
- Make it look like a senior developer wrote it

Show before/after for the changes.
```

---

## 💪 YOU'RE SET!

Save this artifact and use it for EVERY PROJECT!

Just copy-paste the rules section at the start of your prompts to any AI tool! 🚀