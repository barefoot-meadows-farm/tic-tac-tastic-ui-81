
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import GameCard from '@/components/GameCard';
import { gameVariants } from '@/utils/games';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Difficulty = 'all' | 'easy' | 'medium' | 'hard';

const Collection = () => {
  const [difficulty, setDifficulty] = useState<Difficulty>('all');
  
  const filteredGames = difficulty === 'all' 
    ? gameVariants 
    : gameVariants.filter(game => game.difficulty === difficulty);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Game Collection</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Explore our complete collection of Tic-Tac-Toe variants, 
                each offering a unique twist on the classic game.
              </p>
            </div>
            
            <div className="flex justify-center mb-10 animate-fade-in [animation-delay:200ms]">
              <div className="flex flex-wrap gap-2 justify-center">
                {(['all', 'easy', 'medium', 'hard'] as const).map((diff) => (
                  <Button
                    key={diff}
                    variant={difficulty === diff ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDifficulty(diff)}
                    className={cn(
                      "capitalize",
                      difficulty === diff && diff === 'easy' && "bg-green-500 hover:bg-green-600",
                      difficulty === diff && diff === 'medium' && "bg-yellow-500 hover:bg-yellow-600",
                      difficulty === diff && diff === 'hard' && "bg-red-500 hover:bg-red-600"
                    )}
                  >
                    {diff === 'all' ? 'All Difficulties' : diff}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filteredGames.map((game, index) => (
                <div key={game.id} className="animate-fade-in" style={{ animationDelay: `${300 + (index * 100)}ms` }}>
                  <GameCard game={game} />
                </div>
              ))}
              
              {filteredGames.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-lg text-muted-foreground">
                    No games found with the selected filter.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Collection;
