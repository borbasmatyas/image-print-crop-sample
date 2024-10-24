## Fill-in vágás
A fill-in módban a kiválasztott papír/képméretet teljesen kitölti a kép. Ha a kép és a kiválasztott méret aránya eltér, a kép szélei levágódnak, így a teljes területet kitölti a kép.

**Megvalósítás:** A kép átméretezése a kiválasztott méretre történik úgy, hogy a képarány megmaradjon, de a kép nagyobb lesz, mint a megadott terület. Az oldalak aránya alapján a levágott területeket egy piros átlátszó réteg jelzi. Ez olyan, mint a CSS-ben a `contain`


## Fit-in vágás
A fit-in módban a kép arányosan beleillik a kiválasztott papír/képméretbe. Az oldalak aránybeli eltérése miatt a kép szélei nem vágódnak le, de lehetnek üres területek a kiválasztott méret és a kép között.

**Megvalósítás:** A kép átméretezése a kiválasztott területhez történik úgy, hogy a kép teljesen beleférjen, de nem vágódik le. Az arányos illesztés miatt a kép és a terület szélei közötti különbség megjelenik, de üresen marad. Ez olyan, mint a CSS-bn a `cover`
