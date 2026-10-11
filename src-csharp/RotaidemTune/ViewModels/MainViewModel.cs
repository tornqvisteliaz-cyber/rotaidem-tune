using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Windows.Input;
using RotaidemTune.Services;

namespace RotaidemTune.ViewModels;

public class MainViewModel : INotifyPropertyChanged
{
    private readonly AudioEngine _audio = new();
    private readonly SimulatedTelemetry _telemetry = new();

    private string _connectionState = "Disconnected";
    private string _flightState = "—";
    private double _indicatedAirspeed;
    private double _masterVolume = 0.6;
    private double _airflowVolume = 0.5;
    private double _cabinVolume = 0.3;
    private bool _airflowEnabled = true;
    private bool _cabinEnabled = false;

    public MainViewModel()
    {
        PreviewCommand = new RelayCommand(StartPreview);
        _telemetry.OnUpdate += OnTelemetry;
    }

    public string ConnectionState { get => _connectionState; set { _connectionState = value; OnPropertyChanged(); } }
    public string FlightState { get => _flightState; set { _flightState = value; OnPropertyChanged(); } }
    public double IndicatedAirspeed { get => _indicatedAirspeed; set { _indicatedAirspeed = value; OnPropertyChanged(); } }
    public double MasterVolume { get => _masterVolume; set { _masterVolume = value; OnPropertyChanged(); UpdateAudio(); } }
    public double AirflowVolume { get => _airflowVolume; set { _airflowVolume = value; OnPropertyChanged(); UpdateAudio(); } }
    public double CabinVolume { get => _cabinVolume; set { _cabinVolume = value; OnPropertyChanged(); UpdateAudio(); } }
    public bool AirflowEnabled { get => _airflowEnabled; set { _airflowEnabled = value; OnPropertyChanged(); UpdateAudio(); } }
    public bool CabinEnabled { get => _cabinEnabled; set { _cabinEnabled = value; OnPropertyChanged(); UpdateAudio(); } }

    public ICommand PreviewCommand { get; }

    private void StartPreview()
    {
        ConnectionState = "Simulated";
        _telemetry.Start();
        _audio.Start();
        UpdateAudio();
    }

    private void OnTelemetry(double ias, string state)
    {
        IndicatedAirspeed = ias;
        FlightState = state;
        UpdateAudio();
    }

    private void UpdateAudio()
    {
        double airflowTarget = 0;
        if (AirflowEnabled && IndicatedAirspeed > 40)
        {
            airflowTarget = Math.Min(1.0, Math.Pow((IndicatedAirspeed - 40) / 210.0, 0.7));
            airflowTarget *= AirflowVolume * MasterVolume;
        }

        double cabinTarget = CabinEnabled ? CabinVolume * MasterVolume * 0.6 : 0;

        _audio.SetAirflowGain(airflowTarget);
        _audio.SetCabinGain(cabinTarget);
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    private void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

public class RelayCommand : ICommand
{
    private readonly Action _execute;
    public RelayCommand(Action execute) => _execute = execute;
    public bool CanExecute(object? parameter) => true;
    public void Execute(object? parameter) => _execute();
    public event EventHandler? CanExecuteChanged
    {
        add { }
        remove { }
    }
}
