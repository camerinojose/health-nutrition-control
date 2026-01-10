import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Modal,
  SafeAreaView
} from 'react-native';
import { useTranslation } from 'react-i18next';
import api from './api';

export default function RecipesScreen({ onNavigate }) {
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

  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => setSelectedRecipe(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardCategory}>{item.category}</Text>
      </View>
      <Text style={styles.recipeName}>{item.name}</Text>
      <View style={styles.recipeMeta}>
        <Text style={styles.metaText}>⏱️ {item.prep_time}min</Text>
        <Text style={styles.metaText}>🔥 {item.calories}kcal</Text>
      </View>
      <View style={styles.macros}>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{item.protein}g</Text>
          <Text style={styles.macroLabel}>Proteína</Text>
        </View>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{item.carbs}g</Text>
          <Text style={styles.macroLabel}>Carbos</Text>
        </View>
        <View style={styles.macroBox}>
          <Text style={styles.macroValue}>{item.fat}g</Text>
          <Text style={styles.macroLabel}>Grasa</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.title}>📖 Recetas</Text>
          <View style={{ width: 60 }} />
        </View>
        <ActivityIndicator size="large" color="#3498db" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.title}>📖 Recetas</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar recetas..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#999"
        />
        <Text style={styles.searchIcon}>🔍</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[
              styles.categoryBtn,
              selectedCategory === cat.id && styles.categoryBtnActive
            ]}
            onPress={() => setSelectedCategory(cat.id)}
          >
            <Text style={styles.categoryIcon}>{cat.icon}</Text>
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === cat.id && styles.categoryLabelActive
              ]}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.resultCount}>
        {filteredRecipes.length} recetas
      </Text>

      <FlatList
        data={filteredRecipes}
        keyExtractor={item => item.id.toString()}
        renderItem={renderRecipeCard}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>😕 No se encontraron recetas</Text>
          </View>
        }
      />

      {selectedRecipe && (
        <Modal
          visible={true}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedRecipe(null)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setSelectedRecipe(null)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedRecipe.name}</Text>
              <View style={styles.modalMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>⏱️</Text>
                  <View>
                    <Text style={styles.metaLabel}>Tiempo</Text>
                    <Text>{selectedRecipe.prep_time} min</Text>
                  </View>
                </View>
                <View style={styles.metaItem}>
                  <Text style={styles.metaIcon}>🔥</Text>
                  <View>
                    <Text style={styles.metaLabel}>Calorías</Text>
                    <Text>{selectedRecipe.calories} kcal</Text>
                  </View>
                </View>
              </View>

              <View style={styles.modalMacros}>
                <View style={styles.modalMacroBox}>
                  <Text style={styles.modalMacroValue}>{selectedRecipe.protein}g</Text>
                  <Text style={styles.modalMacroLabel}>Proteína</Text>
                </View>
                <View style={styles.modalMacroBox}>
                  <Text style={styles.modalMacroValue}>{selectedRecipe.carbs}g</Text>
                  <Text style={styles.modalMacroLabel}>Carbos</Text>
                </View>
                <View style={styles.modalMacroBox}>
                  <Text style={styles.modalMacroValue}>{selectedRecipe.fat}g</Text>
                  <Text style={styles.modalMacroLabel}>Grasa</Text>
                </View>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🛒 Ingredientes</Text>
                {selectedRecipe.ingredients.split('\n').map((ingredient, idx) => (
                  <Text key={idx} style={styles.ingredient}>• {ingredient}</Text>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>👨‍🍳 Preparación</Text>
                {selectedRecipe.instructions.split('\n').map((step, idx) => (
                  <Text key={idx} style={styles.instruction}>{step}</Text>
                ))}
              </View>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    padding: 5,
  },
  backBtnText: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: '600',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  searchIcon: {
    fontSize: 18,
    marginLeft: 5,
  },
  categoriesContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  categoriesContent: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  categoryBtnActive: {
    backgroundColor: '#3498db',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#666',
  },
  categoryLabelActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultCount: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 15,
    marginVertical: 10,
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  cardHeader: {
    marginBottom: 8,
  },
  cardCategory: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroBox: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  macroLabel: {
    fontSize: 11,
    color: '#999',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  closeBtn: {
    fontSize: 28,
    color: '#999',
  },
  modalContent: {
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalMeta: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  metaLabel: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#666',
  },
  modalMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalMacroBox: {
    alignItems: 'center',
  },
  modalMacroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  modalMacroLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 14,
    color: '#333',
    marginBottom: 6,
    lineHeight: 20,
  },
  instruction: {
    fontSize: 14,
    color: '#333',
    marginBottom: 10,
    lineHeight: 20,
  },
});
