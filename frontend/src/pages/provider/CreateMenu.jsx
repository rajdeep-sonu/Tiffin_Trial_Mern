import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CreateMenu = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const [menuData, setMenuData] = useState({
    Monday: { breakfast: '', lunch: '', dinner: '' },
    Tuesday: { breakfast: '', lunch: '', dinner: '' },
    Wednesday: { breakfast: '', lunch: '', dinner: '' },
    Thursday: { breakfast: '', lunch: '', dinner: '' },
    Friday: { breakfast: '', lunch: '', dinner: '' },
    Saturday: { breakfast: '', lunch: '', dinner: '' },
    Sunday: { breakfast: '', lunch: '', dinner: '' },
  });

  // Store images per meal: mealImages[day][mealType] = File
  const [mealImages, setMealImages] = useState(() => {
    const init = {};
    days.forEach(day => {
      init[day] = { breakfast: null, lunch: null, dinner: null };
    });
    return init;
  });

  // Store image previews per meal
  const [mealImagePreviews, setMealImagePreviews] = useState(() => {
    const init = {};
    days.forEach(day => {
      init[day] = { breakfast: null, lunch: null, dinner: null };
    });
    return init;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleMealChange = (day, mealType, value) => {
    setMenuData(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [mealType]: value
      }
    }));
  };

  const handleMealImageChange = (day, mealType, file) => {
    if (!file) {
      setMealImages(prev => ({
        ...prev,
        [day]: { ...prev[day], [mealType]: null }
      }));
      setMealImagePreviews(prev => ({
        ...prev,
        [day]: { ...prev[day], [mealType]: null }
      }));
      return;
    }

    // Store the file
    setMealImages(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: file }
    }));

    // Create preview
    const preview = URL.createObjectURL(file);
    setMealImagePreviews(prev => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: preview }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    try {
      // Build menu object from days
      const menuObject = {};
      days.forEach(day => {
        menuObject[day] = {
          breakfast: menuData[day].breakfast || '',
          lunch: menuData[day].lunch || '',
          dinner: menuData[day].dinner || ''
        };
      });

      // Check if at least one meal is added
      const hasItems = Object.values(menuObject).some(dayMenu => 
        dayMenu.breakfast || dayMenu.lunch || dayMenu.dinner
      );

      if (!hasItems) {
        setError('Please add at least one meal');
        setLoading(false);
        return;
      }

      // Calculate week dates (Monday to Sunday of current week)
      const today = new Date();
      const firstDay = today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(firstDay));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Create FormData
      const formData = new FormData();

      // Add JSON fields
      formData.append('weekStart', weekStart.toISOString());
      formData.append('weekEnd', weekEnd.toISOString());
      formData.append('menu', JSON.stringify(menuObject));

      // Add images per meal
      console.log('Adding meal images to FormData...');
      let totalImages = 0;
      days.forEach(day => {
        ['breakfast', 'lunch', 'dinner'].forEach(mealType => {
          const file = mealImages[day][mealType];
          if (file) {
            const fieldName = `images_${day}_${mealType}`;
            formData.append(fieldName, file);
            totalImages++;
            console.log(`✓ Added ${fieldName}:`, file.name, file.size, 'bytes');
          }
        });
      });

      console.log(`Total images to upload: ${totalImages}`);

      // Debug: Log FormData contents
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        if (pair[0].startsWith('images_')) {
          console.log(pair[0] + ':', pair[1].name, `(${pair[1].size} bytes)`);
        } else {
          console.log(pair[0] + ':', typeof pair[1] === 'string' ? pair[1].substring(0, 50) : pair[1]);
        }
      }

      // Send to backend
      console.log('Submitting to /provider/menu...');
      const response = await apiClient.post('/provider/menu', formData);

      console.log('Success response:', response.data);
      setSuccessMsg(response.data.message || 'Menu created successfully with images!');
      
      // Reset form
      setMenuData({
        Monday: { breakfast: '', lunch: '', dinner: '' },
        Tuesday: { breakfast: '', lunch: '', dinner: '' },
        Wednesday: { breakfast: '', lunch: '', dinner: '' },
        Thursday: { breakfast: '', lunch: '', dinner: '' },
        Friday: { breakfast: '', lunch: '', dinner: '' },
        Saturday: { breakfast: '', lunch: '', dinner: '' },
        Sunday: { breakfast: '', lunch: '', dinner: '' },
      });
      
      const newMealImages = {};
      days.forEach(day => {
        newMealImages[day] = { breakfast: null, lunch: null, dinner: null };
      });
      setMealImages(newMealImages);
      
      const newMealPreviews = {};
      days.forEach(day => {
        newMealPreviews[day] = { breakfast: null, lunch: null, dinner: null };
      });
      setMealImagePreviews(newMealPreviews);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error details:', err);
      const message = err.response?.data?.message || err.message || 'Failed to create menu. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-brand-dark text-brand-textMain font-sans animate-fade-in pb-12">
      {/* Header */}
      <header className="glass-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-5 flex justify-between items-center">
          <button
            onClick={() => navigate('/provider/dashboard')}
            className="text-brand-textMuted hover:text-brand-primary font-bold flex items-center gap-2 transition hover:scale-105 active:scale-95"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-2xl md:text-3xl font-black culinary-gradient-text drop-shadow-md flex items-center gap-2">
            🍽️ Create Weekly Menu
          </h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-brand-accent/15 hover:bg-brand-accent text-brand-textMain border border-brand-accent/30 hover:border-brand-accent/50 font-bold rounded-xl transition hover:scale-105 active:scale-95 text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 animate-slide-up">
        {error && (
          <div className="mb-6 p-4 bg-brand-accent/10 border border-brand-accent/30 text-brand-textMain rounded-xl shadow-md flex items-center gap-2">
            ❌ {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 bg-brand-secondary/10 border border-brand-secondary/30 text-brand-textMain rounded-xl shadow-md flex items-center gap-2">
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8">
          {/* Weekly Menu Section */}
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-brand-textMain mb-3 flex items-center gap-2">
              📅 Weekly Menu
            </h2>
            <p className="text-brand-textMuted mb-8 text-sm md:text-base bg-brand-dark/30 border-l-4 border-brand-primary p-4 rounded-r-xl border border-y-brand-border border-r-brand-border">
              📸 Enter meals and upload food images for each day to showcase your offerings
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {days.map(day => {
                return (
                  <div key={day} className="bg-brand-dark/30 border border-brand-border rounded-2xl p-6 transition-all duration-300 hover:border-brand-borderHover hover:shadow-glass-glow hover:scale-[1.01]">
                    <h3 className="font-black text-lg text-brand-textMain mb-5 flex items-center gap-2 border-b border-brand-border pb-2">
                      🌟 {day}
                    </h3>
                    <div className="space-y-5">
                      {/* Breakfast */}
                      <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-4 shadow-sm space-y-2">
                        <label className="block text-xs font-bold text-brand-primary uppercase tracking-wider">🌅 Breakfast</label>
                        <input
                          type="text"
                          placeholder="e.g., Dosa, Idli, Pancakes"
                          value={menuData[day].breakfast}
                          onChange={(e) => handleMealChange(day, 'breakfast', e.target.value)}
                          className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-4 py-2.5 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm mb-2"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition hover:scale-105 active:scale-95">
                            📷 Add Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleMealImageChange(day, 'breakfast', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {mealImagePreviews[day]?.breakfast && (
                            <>
                              <img
                                src={mealImagePreviews[day].breakfast}
                                alt="Breakfast preview"
                                className="h-10 w-10 rounded-lg object-cover border border-brand-borderHover shadow"
                              />
                              <button
                                type="button"
                                onClick={() => handleMealImageChange(day, 'breakfast', null)}
                                className="text-brand-accent hover:text-brand-accent/80 font-bold bg-brand-accent/10 hover:bg-brand-accent/20 px-2.5 py-1.5 rounded-lg text-xs transition border border-brand-accent/20"
                              >
                                ✕ Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Lunch */}
                      <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-4 shadow-sm space-y-2">
                        <label className="block text-xs font-bold text-amber-500 uppercase tracking-wider">🍽️ Lunch</label>
                        <input
                          type="text"
                          placeholder="e.g., Rice, Dal, Raita"
                          value={menuData[day].lunch}
                          onChange={(e) => handleMealChange(day, 'lunch', e.target.value)}
                          className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-4 py-2.5 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm mb-2"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition hover:scale-105 active:scale-95">
                            📷 Add Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleMealImageChange(day, 'lunch', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {mealImagePreviews[day]?.lunch && (
                            <>
                              <img
                                src={mealImagePreviews[day].lunch}
                                alt="Lunch preview"
                                className="h-10 w-10 rounded-lg object-cover border border-brand-borderHover shadow"
                              />
                              <button
                                type="button"
                                onClick={() => handleMealImageChange(day, 'lunch', null)}
                                className="text-brand-accent hover:text-brand-accent/80 font-bold bg-brand-accent/10 hover:bg-brand-accent/20 px-2.5 py-1.5 rounded-lg text-xs transition border border-brand-accent/20"
                              >
                                ✕ Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Dinner */}
                      <div className="bg-brand-dark/40 border border-brand-border/60 rounded-xl p-4 shadow-sm space-y-2">
                        <label className="block text-xs font-bold text-brand-accent uppercase tracking-wider">🥘 Dinner</label>
                        <input
                          type="text"
                          placeholder="e.g., Roti, Sabji, Gravy"
                          value={menuData[day].dinner}
                          onChange={(e) => handleMealChange(day, 'dinner', e.target.value)}
                          className="w-full bg-brand-dark/50 border border-brand-border rounded-xl px-4 py-2.5 text-brand-textMain placeholder-brand-textMuted/40 focus:outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 transition-all text-sm mb-2"
                        />
                        <div className="flex items-center gap-2 flex-wrap">
                          <label className="flex items-center gap-1.5 cursor-pointer bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition hover:scale-105 active:scale-95">
                            📷 Add Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleMealImageChange(day, 'dinner', e.target.files?.[0] || null)}
                              className="hidden"
                            />
                          </label>
                          {mealImagePreviews[day]?.dinner && (
                            <>
                              <img
                                src={mealImagePreviews[day].dinner}
                                alt="Dinner preview"
                                className="h-10 w-10 rounded-lg object-cover border border-brand-borderHover shadow"
                              />
                              <button
                                type="button"
                                onClick={() => handleMealImageChange(day, 'dinner', null)}
                                className="text-brand-accent hover:text-brand-accent/80 font-bold bg-brand-accent/10 hover:bg-brand-accent/20 px-2.5 py-1.5 rounded-lg text-xs transition border border-brand-accent/20"
                              >
                                ✕ Remove
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-4 culinary-gradient disabled:from-brand-border/40 disabled:to-brand-border/40 disabled:text-brand-textMuted text-white font-bold text-lg rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg hover:shadow-glass-glow hover:scale-[1.01] active:scale-95 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating Menu with Images...
              </>
            ) : (
              <>
                <span>✅</span>
                Create Menu with Images
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default CreateMenu;
