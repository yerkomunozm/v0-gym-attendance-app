/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Mock Supabase client for testing
 * This provides a mock implementation of the Supabase client to avoid database dependencies in tests
 */

type MockQueryBuilder = {
    select: jest.Mock
    insert: jest.Mock
    update: jest.Mock
    delete: jest.Mock
    eq: jest.Mock
    neq: jest.Mock
    gt: jest.Mock
    gte: jest.Mock
    lt: jest.Mock
    lte: jest.Mock
    like: jest.Mock
    ilike: jest.Mock
    is: jest.Mock
    in: jest.Mock
    contains: jest.Mock
    containedBy: jest.Mock
    rangeLt: jest.Mock
    rangeGt: jest.Mock
    rangeGte: jest.Mock
    rangeLte: jest.Mock
    rangeAdjacent: jest.Mock
    overlaps: jest.Mock
    textSearch: jest.Mock
    match: jest.Mock
    not: jest.Mock
    or: jest.Mock
    filter: jest.Mock
    order: jest.Mock
    limit: jest.Mock
    range: jest.Mock
    single: jest.Mock
    maybeSingle: jest.Mock
}

/**
 * Creates a chainable mock query builder
 */
export const createMockQueryBuilder = (
    mockData: any = { data: [], error: null }
): MockQueryBuilder => {
    const builder: any = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        neq: jest.fn().mockReturnThis(),
        gt: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lt: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        like: jest.fn().mockReturnThis(),
        ilike: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        contains: jest.fn().mockReturnThis(),
        containedBy: jest.fn().mockReturnThis(),
        rangeLt: jest.fn().mockReturnThis(),
        rangeGt: jest.fn().mockReturnThis(),
        rangeGte: jest.fn().mockReturnThis(),
        rangeLte: jest.fn().mockReturnThis(),
        rangeAdjacent: jest.fn().mockReturnThis(),
        overlaps: jest.fn().mockReturnThis(),
        textSearch: jest.fn().mockReturnThis(),
        match: jest.fn().mockReturnThis(),
        not: jest.fn().mockReturnThis(),
        or: jest.fn().mockReturnThis(),
        filter: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockData),
        maybeSingle: jest.fn().mockResolvedValue(mockData),
    }

    // Default promise resolution for the builder
    builder.then = jest.fn((resolve: any) => resolve(mockData))

    return builder as MockQueryBuilder
}

/**
 * Creates a mock Supabase client
 */
export const createMockSupabaseClient = () => {
    return {
        from: jest.fn((table: string) => createMockQueryBuilder()),
        auth: {
            getSession: jest.fn().mockResolvedValue({
                data: { session: null },
                error: null,
            }),
            getUser: jest.fn().mockResolvedValue({
                data: { user: null },
                error: null,
            }),
            signInWithPassword: jest.fn().mockResolvedValue({
                data: { user: null, session: null },
                error: null,
            }),
            signOut: jest.fn().mockResolvedValue({
                error: null,
            }),
            onAuthStateChange: jest.fn().mockReturnValue({
                data: { subscription: { unsubscribe: jest.fn() } },
            }),
        },
        storage: {
            from: jest.fn(() => ({
                upload: jest.fn().mockResolvedValue({ data: null, error: null }),
                download: jest.fn().mockResolvedValue({ data: null, error: null }),
                remove: jest.fn().mockResolvedValue({ data: null, error: null }),
                list: jest.fn().mockResolvedValue({ data: [], error: null }),
                getPublicUrl: jest.fn().mockReturnValue({
                    data: { publicUrl: 'https://example.com/file.jpg' },
                }),
            })),
        },
    }
}

/**
 * Mock the Supabase client module
 */
export const mockSupabase = createMockSupabaseClient()

// Export for use in jest.mock
export default mockSupabase
