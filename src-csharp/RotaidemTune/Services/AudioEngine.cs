using System.IO;
using NAudio.Wave;

namespace RotaidemTune.Services;

public class AudioEngine : IDisposable
{
    private WaveOutEvent? _airflowOut;
    private WaveOutEvent? _cabinOut;
    private AudioFileReader? _airflowReader;
    private AudioFileReader? _cabinReader;
    private bool _started;

    public void Start()
    {
        if (_started) return;
        _started = true;

        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var airflowPath = Path.Combine(baseDir, "Assets", "airflow-wind.wav");
        var cabinPath = Path.Combine(baseDir, "Assets", "cabin-ambience.wav");

        if (File.Exists(airflowPath))
        {
            _airflowReader = new AudioFileReader(airflowPath) { Volume = 0 };
            _airflowOut = new WaveOutEvent();
            _airflowOut.Init(_airflowReader);
            _airflowOut.Play();
        }

        if (File.Exists(cabinPath))
        {
            _cabinReader = new AudioFileReader(cabinPath) { Volume = 0 };
            _cabinOut = new WaveOutEvent();
            _cabinOut.Init(_cabinReader);
            _cabinOut.Play();
        }
    }

    public void SetAirflowGain(double gain)
    {
        if (_airflowReader != null)
            _airflowReader.Volume = (float)Math.Clamp(gain, 0, 1);
    }

    public void SetCabinGain(double gain)
    {
        if (_cabinReader != null)
            _cabinReader.Volume = (float)Math.Clamp(gain, 0, 1);
    }

    public void Dispose()
    {
        _airflowOut?.Stop();
        _airflowOut?.Dispose();
        _airflowReader?.Dispose();
        _cabinOut?.Stop();
        _cabinOut?.Dispose();
        _cabinReader?.Dispose();
    }
}
