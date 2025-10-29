export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id')!
    const base = [
      { id:'1', title:'Spinach and Ricotta Stuffed Shells', img:'https://picsum.photos/900/600?1',
        subtitle:'Classic Italian comfort food with a vegetarian twist.',
        time:35, difficulty:'Easy', kcal:520, protein:22, carb:65, fat:18,
        vegetarian:true, ingredients:['pâtes','ricotta','épinards','sauce tomate'] },
      { id:'2', title:'Caprese Skewers', img:'https://picsum.photos/900/600?2',
        subtitle:'Refreshing appetizer perfect for any occasion.',
        time:15, difficulty:'Easy', kcal:180, protein:9, carb:6, fat:12,
        vegetarian:true, ingredients:['tomates','mozzarella','basilic','huile d\'olive'] },
      { id:'3', title:'Chocolate Avocado Mousse', img:'https://picsum.photos/900/600?3',
        subtitle:'Rich and creamy dessert with a healthy secret.',
        time:10, difficulty:'Easy', kcal:320, protein:5, carb:28, fat:22,
        vegetarian:true, ingredients:['avocat','cacao','sirop d\'érable'] },
    ]
    return base.find(x => x.id === id) ?? base[0]
  })
  

