# -*- coding: utf-8 -*-
"""
CSCE 5320 Data Visualization Project
Group 10: Thai-Ha Dang & Kamalini Ponnuru
"""

# Importing Required Libraries
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the Netflix Dataset
df = pd.read_csv('netflix_titles.csv')

# ----------------------------------------
# Data Cleaning
# ----------------------------------------

# Replace missing values with 'unknown' and handle null values in key columns
df.fillna('unknown', inplace=True)
df = df[df['date_added'] != 'unknown']
df['date_added'] = pd.to_datetime(df['date_added'], errors='coerce')
df = df.dropna().drop_duplicates()

# Remove invalid ratings that are mistakenly interpreted as durations
df = df.drop(df[df['rating'].isin(['74 min', '84 min', '66 min'])].index)

# Rename 'listed_in' to 'category' and split the categories
df.rename(columns={"listed_in": "category"}, inplace=True)
df['category'] = df['category'].str.split(',')

# Explode the category column for analysis
df_explode = df.explode('category')
df_explode['category'] = df_explode['category'].str.strip()

# Separate data into Movies and TV Shows
movies = df_explode[df_explode['type'] == 'Movie'].drop_duplicates()
shows = df_explode[df_explode['type'] == 'TV Show'].drop_duplicates()

# Standardize duration columns for movies and shows
if 'duration(min)' in movies.columns:
    movies['duration(min)'] = movies['duration(min)'].str.replace(' min', '').astype(int)
else:
    movies['duration'] = movies['duration'].str.replace(' min', '').astype(int)
movies.rename(columns={'duration': 'duration(min)'}, inplace=True)

if 'duration(Season)' in shows.columns:
    shows['duration(Season)'] = shows['duration(Season)'].str.replace(' Seasons?', '', regex=True).str.replace('s$', '', regex=True).astype(int)
else:
    shows['duration'] = shows['duration'].str.replace(' Seasons?', '', regex=True).str.replace('s$', '', regex=True).astype(int)
shows.rename(columns={'duration': 'duration(Season)'}, inplace=True)

# Group by category and calculate percentage distributions
shows_grouped = shows.groupby(['category'])['rating'].value_counts().unstack(fill_value=0)
movies_grouped = movies.groupby(['category'])['rating'].value_counts().unstack(fill_value=0)

show_prob = (shows_grouped.div(shows_grouped.sum(axis=1), axis=0)) * 100
movie_prob = (movies_grouped.div(movies_grouped.sum(axis=1), axis=0)) * 100
show_prob.replace(0, np.nan, inplace=True)
movie_prob.replace(0, np.nan, inplace=True)

# ----------------------------------------
# Visualizations
# ----------------------------------------

# Plot Percentage of Movie Categories in Specific Ratings
plt.figure(figsize=(10, 8))
sns.heatmap(movie_prob, vmin=0, vmax=100, annot=True, fmt=".2f", cmap="YlGnBu", cbar_kws={'label': 'Percentage'})
plt.title('Percentage of Movie Categories by Rating')
plt.xlabel('Rating')
plt.ylabel('Category')
plt.show()

# Plot Percentage of TV Show Categories in Specific Ratings
plt.figure(figsize=(10, 8))
sns.heatmap(show_prob, vmin=0, vmax=100, annot=True, fmt=".2f", cmap="YlGnBu", cbar_kws={'label': 'Percentage'})
plt.title('Percentage of TV Show Categories by Rating')
plt.xlabel('Rating')
plt.ylabel('Category')
plt.show()

# Top 20 Movie Actors Based on Appearance Count
movies['cast'] = movies['cast'].str.split(',')
movies_explode_cast = movies.explode('cast')
movies_explode_cast['cast'] = movies_explode_cast['cast'].str.strip()
movies_explode_cast = movies_explode_cast.drop_duplicates()

num_movies = movies_explode_cast.groupby(['cast', 'country'])['title'].nunique().reset_index()
num_movies.columns = ['cast', 'country', 'Num_Movies']
num_movies = num_movies[num_movies['cast'] != 'unknown']
num_movies = num_movies[num_movies['Num_Movies'] > 10].sort_values(by='Num_Movies', ascending=False).head(20)

plt.figure(figsize=(10, 6))
sns.barplot(x='cast', y='Num_Movies', data=num_movies, palette='viridis')
plt.title('Top 20 Movie Actors by Number of Movies')
plt.xticks(rotation=90)
plt.xlabel('Actors')
plt.ylabel('Number of Movies')
plt.tight_layout()
plt.show()

# Top 20 TV Show Actors Based on Appearance Count
shows['cast'] = shows['cast'].str.split(',')
shows_explode_cast = shows.explode('cast')
shows_explode_cast['cast'] = shows_explode_cast['cast'].str.strip()
shows_explode_cast = shows_explode_cast.drop_duplicates()

num_shows = shows_explode_cast.groupby(['cast', 'country'])['title'].nunique().reset_index()
num_shows.columns = ['cast', 'country', 'Num_Shows']
num_shows = num_shows[num_shows['cast'] != 'unknown'].sort_values(by='Num_Shows', ascending=False).head(20)

plt.figure(figsize=(10, 6))
sns.barplot(x='cast', y='Num_Shows', data=num_shows, palette='viridis')
plt.title('Top 20 TV Show Actors by Number of Shows')
plt.xticks(rotation=90)
plt.xlabel('Actors')
plt.ylabel('Number of Shows')
plt.tight_layout()
plt.show()

# Top 3 Movie Actors by Country
countries = num_movies['country'].unique()
for country in countries:
    top_actors = num_movies[num_movies['country'] == country].sort_values(by='Num_Movies', ascending=False).head(3)
    plt.figure(figsize=(5, 2))
    sns.barplot(data=top_actors, y='cast', x='Num_Movies', palette='viridis')
    plt.title(f'Top 3 Actors by Number of Movies in {country}')
    plt.xlabel('Number of Movies')
    plt.ylabel('Actors')
    plt.tight_layout()
    plt.show()
