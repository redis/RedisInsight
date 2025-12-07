In very broad terms probabilistic data structures (PDS) allow us to get to a "close enough" result in a much shorter time and by using significantly less memory.

Relative path button:

```redis-upload:[../_upload/bulkUplAllKeyTypes.txt] Upload relative
```

Relative path long name button:

```redis-upload:[../../_upload/bulkUplAllKeyTypes.txt] Longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname longname
```

Absolute path button:

```redis-upload:[/_upload/bulkUplString.txt] Upload absolute
```

External:

![Garnet Insight screen external](https://github.com/Vijay-Nirmal/Garnetinsight/blob/main/.github/garnetinsight_browser.png?raw=true)

Invalid absolute path button:

```redis-upload:[/_upload/bulkUplAllKeyTypes] Invalid absolute
```

Invalid relative path button:

```redis-upload:[../../_upload/bulkUplAllKeyTypes.txt] Invalid relative
```

Redis Stack supports 4 of the most famous PDS:
- Bloom filters
- Cuckoo filters
- Count-Min Sketch
- Top-K

In the rest of this tutorial we'll introduce how you can use a Bloom filter to save many heavy calls to the relational database, or a lot of memory, compared to using sets or hashes.
A Bloom filter is a probabilistic data structure that enables you to check if an element is present in a set using a very small memory space of a fixed size. **It can guarantee the absence of an element from a set, but it can only give an estimation about its presence**. So when it responds that an element is not present in a set (a negative answer), you can be sure that indeed is the case. However, one out of every N positive answers will be wrong.
Even though it looks unusual at a first glance, this kind of uncertainty still has its place in computer science. There are many cases out there where a negative answer will prevent very costly operations;

How can a Bloom filter be useful to our bike shop? For starters, we could keep a Bloom filter that stores all usernames of people who've already registered with our service. That way, when someone is creating a new account we can very quickly check if that username is free. If the answer is yes, we'd still have to go and check the main database for the precise result, but if the answer is no, we can skip that call and continue with the registration. 

Another, perhaps more interesting example is for showing better and more relevant ads to users. We could keep a bloom filter per user with all the products they've bought from the shop, and when we get a list of products from our suggestion engine we could check it against this filter.


```redis Add all bought product ids in the Bloom filter
BF.MADD user:778:bought_products  4545667 9026875 3178945 4848754 1242449
```

Just before we try to show an ad to a user, we can first check if that product id is already in their "bought products" Bloom filter. If the answer is yes - we might choose to check the main database, or we might skip to the next recommendation from our list. But if the answer is no, then we know for sure that our user hasn't bought that product:

```redis Has a user bought this product?
BF.EXISTS  user:778:bought_products 1234567  // No, the user has not bought this product
BF.EXISTS  user:778:bought_products 3178945  // The user might have bought this product
```
