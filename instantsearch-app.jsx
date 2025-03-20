import React from 'react';
import algoliasearch from 'algoliasearch/lite';
import { InstantSearch, SearchBox, InfiniteHits, RefinementList, ClearRefinements, Highlight } from 'react-instantsearch';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { createClient } from '@algolia/generative-experiences-api-client';
import { ShoppingGuidesHeadlines, } from '@algolia/generative-experiences-react';
import './styles.css';

console.log('App.jsx is running');

// Import sensitive data from .env file
const appId = import.meta.env.VITE_ALGOLIA_APP_ID;
const indexName = import.meta.env.VITE_ALGOLIA_INDEX_NAME;
const searchOnlyAPIKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY;

console.log('Algolia Credentials:', {
  appId,
  indexName,
  hasSearchKey: !!searchOnlyAPIKey
});

// Initialize the search client
const searchClient = algoliasearch(appId, searchOnlyAPIKey);

// Initialize the Generative Experiences client
const generativeClient = createClient({
  appId,
  indexName,
  searchOnlyAPIKey,
});

// Add these styles at the top of your file, after the imports
const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1rem',
    '& .ais-InfiniteHits-list': {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1.5rem',
      listStyle: 'none',
      padding: 0,
    },
    '& .ais-SearchBox': {
      marginBottom: '2rem',
    }
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease',
    backgroundColor: 'white',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    maxWidth: '300px',
    margin: '0 auto',
  },
  image: {
    width: '100%',
    aspectRatio: '4/3',
    objectFit: 'cover',
    display: 'block',
  },
  content: {
    padding: '1rem',
  },
  rating: {
    color: '#666',
    fontSize: '0.9rem',
  },
  timing: {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0,
  },
  servings: {
    color: '#666',
    fontSize: '0.9rem',
    margin: 0,
  }
};

function Hit({ hit }) {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/recipe/${encodeURIComponent(hit.objectID)}`, { state: { recipe: hit } });
  };

  return (
    <article className="recipe-card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <img 
        src={hit.img_src} 
        alt={hit.recipe_name} 
        className="recipe-image"
      />
      <div className="recipe-content">
        <Highlight attribute="recipe_name" hit={hit} />
        <div className="recipe-meta">
          <p className="recipe-rating">⭐ {hit.rating}</p>
          <p className="recipe-time">⏱ {hit.total_time}</p>
          <p className="recipe-servings">👥 {hit.servings} servings</p>
        </div>
      </div>
    </article>
  );
}

function SearchPage() {
  console.log('SearchPage rendering with:', { appId, indexName });
  
  if (!appId || !indexName || !searchOnlyAPIKey) {
    console.error('Missing required Algolia credentials');
    return <div>Error: Missing Algolia credentials</div>;
  }

  return (
    <InstantSearch 
      searchClient={searchClient} 
      indexName={indexName} 
      insights={true}
    >
      <div className="search-container">
        <img 
          src="https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/01/this-is-fine.jpg"
          alt="Banner"
          className="search-banner"
        />
        <SearchBox className="search-box" />
        <div className="shopping-guides-container">
          <h2>Recipe Inspiration</h2>
          <div className="shopping-guides-grid">
            <ShoppingGuidesHeadlines
              showFeedback
              userToken="test-user-123"
              client={generativeClient}
              category="5"
              showImmediate
              nbResults={6}
              onError={(error) => {
                console.error('ShoppingGuidesHeadlines error:', error);
                console.error('Error details:', {
                  name: error.name,
                  message: error.message,
                  code: error.code,
                  status: error.status
                });
              }}
              onDataReceived={(data) => {
                console.log('ShoppingGuidesHeadlines data:', data);
              }}
            />
          </div>
        </div>
        <div className="search-layout">
          <div className="refinements-panel">
            <div className="refinement-section">
              <ClearRefinements />
              <h3>Rating</h3>
              <RefinementList 
                attribute="rating" 
                operators="or"
                showMore={true}
                sortBy={['name:desc']}
              />
              <h3>Cook Time</h3>
              <RefinementList 
                attribute="cook_time" 
                operators="or"
                showMore={true}
                sortBy={['name:desc']}
              />
              <h3>Prep Time</h3>
              <RefinementList 
                attribute="prep_time" 
                operators="or"
                showMore={true}
                sortBy={['name:desc']}
              />
            </div>
          </div>
          <div className="results-panel">
            <InfiniteHits hitComponent={Hit} />
          </div>
        </div>
      </div>
    </InstantSearch>
  );
}

function RecipeDetail() {
  const { state } = useLocation();
  const recipe = state?.recipe;

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-header">
        <img src={recipe.img_src} alt={recipe.recipe_name} />
        <div className="recipe-detail-info">
          <h1>{recipe.recipe_name}</h1>
          <p className="recipe-rating">⭐ Rating: {recipe.rating}</p>
          <div className="recipe-timing">
            <p>⏱ Prep Time: {recipe.prep_time}</p>
            <p>⏱ Cook Time: {recipe.cook_time}</p>
            <p>⏱ Total Time: {recipe.total_time}</p>
          </div>
          <p>👥 Servings: {recipe.servings}</p>
        </div>
      </div>
      
      <div className="recipe-detail-content">
        <section>
          <h2>Ingredients</h2>
          <p>{recipe.ingredients}</p>
        </section>
        
        <section>
          <h2>Directions</h2>
          <p>{recipe.directions}</p>
        </section>

        <section>
          <h2>Nutrition Information</h2>
          <p>{recipe.nutrition}</p>
        </section>

        <a 
          href={recipe.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="recipe-source-link"
        >
          View Original Recipe
        </a>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/recipe/:id" element={<RecipeDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;