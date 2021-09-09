import { Database } from "../src/database";
import { minutes } from "./utils";

describe("Queries Across Tables", () => {
  let db: Database;

  beforeAll(async () => {
    db = await Database.fromExisting("06", "07");
  }, minutes(3));

  it(
    "should select top three directors ordered by total budget spent in their movies",
    async done => {
      const query = `SELECT 
      full_name as director, ROUND(SUM(budget_adjusted), 2) AS total_budget
      FROM directors, movies, movie_directors
      WHERE directors.id = movie_directors.director_id 
      AND movies.id = movie_directors.movie_id
      GROUP BY director
      ORDER BY total_budget desc 
      LIMIT 3`;

      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          director: "Ridley Scott",
          total_budget: 722882143.58
        },
        {
          director: "Michael Bay",
          total_budget: 518297522.1
        },
        {
          director: "David Yates",
          total_budget: 504100108.5
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top 10 keywords ordered by their appearance in movies",
    async done => {
      const query = `SELECT 
      keyword, COUNT(keywords.id) as count 
      FROM keywords, movie_keywords 
      WHERE keywords.id = movie_keywords.keyword_id
      GROUP BY keyword
      ORDER BY count desc
      LIMIT 10`;

      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          keyword: "woman director",
          count: 162
        },
        {
          keyword: "independent film",
          count: 115
        },
        {
          keyword: "based on novel",
          count: 85
        },
        {
          keyword: "duringcreditsstinger",
          count: 82
        },
        {
          keyword: "biography",
          count: 78
        },
        {
          keyword: "murder",
          count: 66
        },
        {
          keyword: "sex",
          count: 60
        },
        {
          keyword: "revenge",
          count: 51
        },
        {
          keyword: "sport",
          count: 50
        },
        {
          keyword: "high school",
          count: 48
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select one movie which has highest count of actors",
    async done => {
      const query = `SELECT COUNT(movie_actors.actor_id) as count, original_title 
      FROM movie_actors, movies 
      WHERE movie_actors.movie_id = movies.id
      GROUP BY original_title 
      ORDER BY count DESC
      LIMIT 1`;

      const result = await db.selectSingleRow(query);

      expect(result).toEqual({
        original_title: "Life",
        count: 12
      });

      done();
    },
    minutes(3)
  );

  it(
    "should select three genres which has most ratings with 5 stars",
    async done => {
      const query = `SELECT genres.genre, COUNT(movie_ratings.rating) AS five_stars_count
      FROM genres, movie_ratings, movie_genres, movies
      WHERE movie_ratings.movie_id = movies.imdb_id 
      AND genres.id = movie_genres.genre_id 
      AND movie_ratings.rating = 5.0
      AND movies.id = movie_genres.movie_id
      GROUP BY genre 
      ORDER BY five_stars_count desc
      LIMIT 3`;

      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Drama",
          five_stars_count: 15052
        },
        {
          genre: "Thriller",
          five_stars_count: 11771
        },
        {
          genre: "Crime",
          five_stars_count: 8670
        }
      ]);

      done();
    },
    minutes(3)
  );

  it(
    "should select top three genres ordered by average rating",
    async done => {
      const query = `SELECT genre, ROUND(AVG(movie_ratings.rating), 2) AS avg_rating
      FROM genres, movie_ratings, movie_genres, movies
      WHERE genres.id = movie_genres.genre_id
      AND movies.id = movie_genres.movie_id
      AND movie_ratings.movie_id = movies.imdb_id
      GROUP BY genre
      ORDER BY avg_rating desc
      LIMIT 3`;

      const result = await db.selectMultipleRows(query);

      expect(result).toEqual([
        {
          genre: "Crime",
          avg_rating: 3.79
        },
        {
          genre: "Music",
          avg_rating: 3.73
        },
        {
          genre: "Documentary",
          avg_rating: 3.71
        }
      ]);

      done();
    },
    minutes(3)
  );
});
