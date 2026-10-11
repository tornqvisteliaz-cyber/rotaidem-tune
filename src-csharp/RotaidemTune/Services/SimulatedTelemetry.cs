namespace RotaidemTune.Services;

public class SimulatedTelemetry
{
    private System.Timers.Timer? _timer;
    private int _phase;
    private double _ias;

    public event Action<double, string>? OnUpdate;

    public void Start()
    {
        _timer?.Stop();
        _timer = new System.Timers.Timer(1000);
        _timer.Elapsed += (_, _) => Tick();
        _timer.Start();
    }

    private void Tick()
    {
        _phase = (_phase + 1) % 50;
        if (_phase < 10) _ias = 15 + _phase * 6;
        else if (_phase < 25) _ias = 75 + (_phase - 10) * 8;
        else _ias = 200;

        string state = _ias < 40 ? "On Ground" :
                       _ias < 80 ? "Takeoff" :
                       _phase < 30 ? "Climb" : "Cruise";

        OnUpdate?.Invoke(_ias, state);
    }

    public void Stop() => _timer?.Stop();
}
