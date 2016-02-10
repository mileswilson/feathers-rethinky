# feathers-rethinky

[![Circle CI](https://circleci.com/gh/mileswilson/feathers-rethinky.svg?style=svg)](https://circleci.com/gh/mileswilson/feathers-rethinky)


  feathers-rethinky
    extend
      ✓ extends and uses extended method
    get
      ✓ returns an instance that exists
      ✓ returns NotFound error for non-existing id
    remove
      ✓ deletes an existing instance and returns the deleted instance
      ✓ deletes multiple instances (40ms)
    find
      ✓ returns all items
      ✓ filters results by a single parameter
      ✓ filters results by multiple parameters
      - can handle complex nested special queries
      special filters
        ✓ can $sort
        ✓ can $limit
        ✓ can $skip
        ✓ can $select
        ✓ can $or
        - can $not
        ✓ can $in
        ✓ can $nin
        ✓ can $lt
        ✓ can $lte
        ✓ can $gt
        ✓ can $gte
        ✓ can $ne
        - can $populate
      paginate
        - returns paginated object, paginates by default and shows total
        - paginates max and skips
    update
      - replaces an existing instance
      - returns NotFound error for non-existing id
    patch
      - updates an existing instance
      - patches multiple instances
      - returns NotFound error for non-existing id
    create
      ✓ creates a single new instance and returns the created instance
      ✓ creates multiple new instances