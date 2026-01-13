TODO : profilr pic upload
TODO : Checkpoint (very important)
TODO:SEO for CSR
When to Implement Hybrid Approach:You should consider adding cached HTML later when:
Performance Issues - Your blog posts load slowly (100+ posts)
High Traffic - You're getting thousands of daily visitors
Complex Posts - Posts with 50+ blocks take time to render
SEO Optimization - You want instant server-side rendering
add related post in blogdetail page
add blog category list page
add author section under blog details page
add global loading

<!-- -- -->

Security concern: Dual role storage creates confusion risk.

Storing roles in two locations (auth.users.user_metadata.role and profiles.role) where only one is authoritative creates a risk of developers accidentally using the wrong source for authorization checks. This pattern has led to security vulnerabilities in other systems.

Additionally, line 64 describes auth.users.user_metadata.role as "deprecated" but lines 66-67 indicate it's still being written during signup. This contradiction is confusing—if deprecated, it should not be written at all.

Recommendations:

Remove role from auth.users.user_metadata entirely to eliminate the dual-storage pattern
If removal isn't feasible, add explicit warnings in code comments near any user_metadata access
Consider adding automated checks (linting rules or tests) to prevent accidental use of user_metadata.role for authorization

<!-- -- -->

CodeRabbit
Nested calls won't update the loading message.

When multiple concurrent withLoader calls occur, only the first call's message is displayed. Subsequent calls pass a message parameter that's silently ignored. Consider whether this is the intended behavior—if not, you may want to update the message on each call or maintain a message stack.

<!-- -- -->
