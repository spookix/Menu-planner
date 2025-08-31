export default defineEventHandler(async (event) => {
    const { q = '' } = getQuery(event)
    // jeux de données mock, 100% végétarien
    const data = [
      { id:'1', title:'Spinach and Ricotta Stuffed Shells', subtitle:'Classic Italian comfort food with a vegetarian twist.', img:'https://picsum.photos/500?food1', tag:'Main Course', time:35, difficulty:'Easy', kcal:520, protein:22, carb:65, fat:18, vegetarian:true, ingredients:['pâtes','ricotta','épinards','sauce tomate'] },
      { id:'2', title:'Caprese Skewers', subtitle:'Refreshing and easy-to-make appetizer.', img:'https://picsum.photos/500?food2', tag:'Appetizer', time:15, difficulty:'Easy', kcal:180, protein:9, carb:6, fat:12, vegetarian:true, ingredients:['tomates','mozzarella','basilic','huile d’olive'] },
      { id:'3', title:'Chocolate Avocado Mousse', subtitle:'A rich and creamy dessert.', img:'https://picsum.photos/500?food3', tag:'Dessert', time:10, difficulty:'Easy', kcal:320, protein:5, carb:28, fat:22, vegetarian:true, ingredients:['avocat','cacao','sirop d’érable'] },
    ]
    const term = String(q).toLowerCase()
    return data.filter(r => !term || r.title.toLowerCase().includes(term) || (r.ingredients ?? []).some(i => i.toLowerCase().includes(term)))
  })
  