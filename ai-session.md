## AI assisted design document creation
 
### Prompt (you sent to AI)
 
Create a design document of REST APIs for an event logging platform with four resource groups:

Sources — registered sources that can produce events. GET /sources, POST /sources.
Events — get, produce, and delete events, events should have reference source by Id and should have a severity property. GET /events, POST /events, DELETE /events/{id}.
Stats — get the stats of events: GET /stats.
Alert — An endpoint for configuring alerts, can toggle on/off, has a time window and a threshold config. PUT /alert/config

### AI Response (trimmed if long)
 
Refer to REST-API.md to see what AI created.

### What Your Team Did With It
 
1-3 bullet points describing:
 
- What was useful
AI created a scaffolding of documentation that's close to 80%-90% complete. It's almost exactly what we wanted.
- What was incorrect, misleading, or not applicable to your project
We had to fill in some details regarding error scenarios, and when it comes to actual implementation, we needed to create the authentication and authorization flow ourselves which the AI misses when it comes to the design.
- How your team verified, modified, or replaced the suggestion
We had a working session to go over the document generated, and examine the document one line at a time to see whether the behaviour is what we wanted and whether we want any of the query parameter or post/put bodies.

## AI assisted work breakdown
 
### Prompt (you sent to AI)
 
Can TypeScript use types/interfaces for dependency injection like .NET does? I created the types in types.ts so I can enable independent development of infrastructure and application layer without blocking one another. Is there no capabilities in typescript to utilize the defined type like an interface?

### AI Response (trimmed if long)
 
AI: You absolutely can use type and interface for dependency injection in TypeScript like .NET does. The solution is to separate concerns into three layers:

    Types (interface/contract) - what you have ✓
    Implementations - the actual database logic
    Composition Root - where you inject dependencies
    Here's how to fix it:
    .... (Code examples on what can be done)

Human: In this sense, application layer still has a hard dependency on the infrastructure, right?

AI: You're absolutely right! I glossed over that. In my example, auth.ts still directly imports the concrete implementation, which is still tight coupling.

    For true decoupling (like .NET's dependency injection), you have a few options:

    Option 1: Constructor/Function Injection (Simplest)

    Option 2: DI Container (More .NET-like)
    Use a library like inversify, tsyringe, or awilix to manage the container automatically.
    .... (More text to explain in detail)

Human: Are dependency injection and DI container used concepts in TypeScript development? If not, maybe forget about it. If yes, which one is more common?
AI: Dependency Injection (the pattern) is absolutely used in TypeScript.

    DI Containers (the framework) are used, but much less common than in .NET.

    Here's what's actually typical in TypeScript/Node.js:

    Constructor/function injection (passing deps as parameters) - Very common, used everywhere
    DI Containers (inversify, tsyringe, etc.) - Less common, mostly in larger enterprise apps
    .... (More text to explain in detail)

### What Your Team Did With It
 
1-3 bullet points describing:
 
- What was useful
AI suggested a practical solution to creating and using types in typescript to enable dependency injection. This allowed our division of labor to execute without blocking one another. We defined the contracts (types) early on and allowed for independent development of the infrastructure layer and the application layer, so as to borrow the terminologies of clean architecture. 
- What was incorrect, misleading, or not applicable to your project
It actually did not offer a right solution upfront. We inspected the solution and realized that the solution offered makes it such that the application layer still depends on infrastructure. It wasn't until further probing we settled on a solution of resolving dependencies during application start up and use a factory pattern for implementing application layer functions.
- How your team verified, modified, or replaced the suggestion
We verified the validity of the suggestion through manual inspection and running the code and see that it works.