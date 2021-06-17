class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    //1. Filtering basic query params
    // eslint-disable-next-line node/no-unsupported-features/es-syntax
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => {
      delete queryObj[el];
    });
    // const toursData = await Tour.find()
    //   .where('duration')
    //   .equals(5)
    //   .where('difficulty')
    //   .equals(10);

    //  const query = Tour.find(queryStr);

    //2.Filtering advance query params likre gte to $gte etc
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    queryStr = JSON.parse(queryStr);

    //the actualy querystring is ?difficulty[gt]=easy&page=1
    //tyhe node provides this query string as follows
    //{ difficulty: { gt: 'easy' }, page: '1' }
    //convert it to the mongo $gte  format
    //{ difficuly: "easy", duration : { $gte: 1}}

    // //3. Implementing Sorting of data
    this.query = this.query.find(queryStr);
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      //sort('price ratingsAverage')- for tie in the first sort tthen  use seocnd criteria
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  fields() {
    //4. Implementing limiting the field to display
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      //query.select('name duration quantity')
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  page() {
    //5. Pagination
    //page=3&limit=10
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    this.query = this.query.skip((page - 1) * limit).limit(limit);

    // if (this.queryString.page) {
    // const numTour = await Tour.countDocuments();
    // if ((page - 1) * limit >= numTour) {
    //   throw new Error('This page doesnot exist');
    // }
    // }
    return this;
  }
}
module.exports = APIFeatures;
