import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from './api';
import './recipes.css';

const Recipes = () => {
  const { t } = useTranslation();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  const categories = [
    { id: 'all', label: 'Todas', icon: '🍽️' },
    { id: 'Desayunos', label: 'Desayunos', icon: '🍳' },
    { id: 'Ensaladas', label: 'Ensaladas', icon: '🥗' },
    { id: 'Proteínas', label: 'Proteínas', icon: '🍖' },
    { id: 'Vegetariana', label: 'Vegetariana', icon: '🥬' }
  ];

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    filterRecipes();
  }, [recipes, selectedCategory, searchTerm]);

  const loadRecipes = async () => {
    try {
      const res = await api.get('/recipes');
      setRecipes(res.data);
    } catch (err) {
      console.error('Error loading recipes:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterRecipes = () => {
    let filtered = recipes;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(search) ||
        r.ingredients.toLowerCase().includes(search)
      );
    }

    setFilteredRecipes(filtered);
  };

  const openRecipe = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeRecipe = () => {
    setSelectedRecipe(null);
  };

  if (loading) {
    return (
      <div className="recipes-container">
        <h2>📖 {t('recipes') || 'Recetas'}</h2>
        <p>Cargando recetas...</p>
      </div>
    );
  }

  return (
    <div className="recipes-container">
      <h2>📖 {t('recipes') || 'Recetas Saludables'}</h2>

      <div className="recipes-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar recetas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="categories">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat.id)}
            >
              <span className="category-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="recipes-stats">
        <p>Mostrando {filteredRecipes.length} de {recipes.length} recetas</p>
      </div>

      <div className="recipes-grid">
        {filteredRecipes.map(recipe => (
          <div 
            key={recipe.id} 
            className="recipe-card"
            onClick={() => openRecipe(recipe)}
          >
            <div 
              className="recipe-image" 
              style={{ backgroundImage: `url(${recipe.image_url})` }}
            >
              <div className="recipe-category">{recipe.category}</div>
            </div>
            <div className="recipe-info">
              <h3>{recipe.name}</h3>
              <div className="recipe-meta">
                <span>⏱️ {recipe.prep_time} min</span>
                <span>🍽️ {recipe.servings} porción(es)</span>
                <span>🔥 {recipe.calories} kcal</span>
              </div>
              <div className="recipe-macros">
                <div className="macro">
                  <span className="macro-label">Proteína</span>
                  <span className="macro-value">{recipe.protein}g</span>
                </div>
                <div className="macro">
                  <span className="macro-label">Carbos</span>
                  <span className="macro-value">{recipe.carbs}g</span>
                </div>
                <div className="macro">
                  <span className="macro-label">Grasa</span>
                  <span className="macro-value">{recipe.fat}g</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="no-results">
          <p>😕 No se encontraron recetas</p>
          <p>Intenta con otros términos de búsqueda o categoría</p>
        </div>
      )}

      {selectedRecipe && (
        <div className="recipe-modal" onClick={closeRecipe}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={closeRecipe}>×</button>
            
            <div 
              className="modal-header" 
              style={{ backgroundImage: `url(${selectedRecipe.image_url})` }}
            >
              <h2>{selectedRecipe.name}</h2>
              <div className="modal-tags">
                <span className="tag">{selectedRecipe.category}</span>
              </div>
            </div>

            <div className="modal-body">
              <div className="modal-meta">
                <div className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  <div>
                    <strong>Tiempo</strong>
                    <p>{selectedRecipe.prep_time} minutos</p>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🍽️</span>
                  <div>
                    <strong>Porciones</strong>
                    <p>{selectedRecipe.servings} persona(s)</p>
                  </div>
                </div>
                <div className="meta-item">
                  <span className="meta-icon">🔥</span>
                  <div>
                    <strong>Calorías</strong>
                    <p>{selectedRecipe.calories} kcal</p>
                  </div>
                </div>
              </div>

              <div className="modal-macros">
                <div className="macro-box">
                  <strong>{selectedRecipe.protein}g</strong>
                  <span>Proteína</span>
                </div>
                <div className="macro-box">
                  <strong>{selectedRecipe.carbs}g</strong>
                  <span>Carbohidratos</span>
                </div>
                <div className="macro-box">
                  <strong>{selectedRecipe.fat}g</strong>
                  <span>Grasa</span>
                </div>
              </div>

              <div className="modal-section">
                <h3>🛒 Ingredientes</h3>
                <div className="ingredients-list">
                  {selectedRecipe.ingredients.split('\n').map((ingredient, index) => (
                    <div key={index} className="ingredient-item">
                      <span className="bullet">•</span>
                      <span>{ingredient}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>👨‍🍳 Preparación</h3>
                <div className="instructions-list">
                  {selectedRecipe.instructions.split('\n').map((step, index) => (
                    <div key={index} className="instruction-step">
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;
