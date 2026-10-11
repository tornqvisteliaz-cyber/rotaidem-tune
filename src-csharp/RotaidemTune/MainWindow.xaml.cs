using System.Windows;
using RotaidemTune.ViewModels;

namespace RotaidemTune;

public partial class MainWindow : Window
{
    public MainWindow()
    {
        InitializeComponent();
        DataContext = new MainViewModel();
    }
}
